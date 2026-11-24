# x86-64 Microarchitecture & Pipeline Optimization

In-depth technical reference on superscalar out-of-order execution, instruction decoders, uop caching, execution port saturation, and dependency breaking based on Dr. Agner Fog's optimization principles and Intel/AMD microarchitectural manuals.

## 1. Superscalar Out-of-Order Execution & uop Pipeline

Modern x86-64 processors (Intel Skylake/Golden Cove/Raptor Cove, AMD Zen 3/Zen 4/Zen 5) do not execute raw x86 instructions natively. The hardware front-end translates variable-length x86 CISC instructions into fixed-length, RISC-like micro-operations ($\mu$ops).

```
Instruction Bytes ──> [Instruction Length Decoder (ILD)]
                              │
                              ▼
                      [Macro-Instruction Decoders]
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
           [Decoded Stream Buffer] [Allocation & Rename]
           (uop Cache / DSB)       (RAT & ROB)
                                        │
                                        ▼
                               [Unified Scheduler]
                                  │   │   │   │
                                  ▼   ▼   ▼   ▼
                               [Port 0] [Port 1] [Port 5] [Port 6] ...
```

### Front-End Bottlenecks: MITE vs DSB

The front-end delivers $\mu$ops through two primary paths:
1. Macro-Instruction Translation Engine (MITE): Uses legacy decoders to parse instruction bytes from L1 instruction cache. Bottlenecked at 4 to 6 instructions per cycle due to variable-length prefix decoding (1 to 15 bytes per instruction).
2. Decoded Stream Buffer (DSB / $\mu$op Cache): Caches decoded $\mu$ops directly. Delivers 6 to 8 $\mu$ops per cycle without decoding overhead.

### The Inner Loop Sizing Invariant

Keep hot computational loops compact enough to reside entirely within the $\mu$op cache:
- An optimal inner loop consists of fewer than 64 to 96 $\mu$ops.
- Excessive loop unrolling (e.g. 16x or 32x) bloats instruction footprints, causes DSB misses, evicts cache lines, and degrades performance compared to modest 2x or 4x unrolling.

## 2. Dependency Chains, Latency vs. Throughput

Execution performance inside the Reorder Buffer (ROB) is governed by two physical metrics:
- Latency: The number of clock cycles between when an instruction receives its input operands and when its output result becomes available.
- Reciprocal Throughput: The minimum number of clock cycles between issuing consecutive independent instructions of the same type.

### Breaking Dependency Chains with Multi-Accumulators

When accumulating values in a loop, writing to a single register ties total execution speed directly to instruction latency:

```nasm
vmulps ymm1, ymm2, ymmword ptr [rsi]
vaddps ymm0, ymm0, ymm1
```

Because `vaddps` has a latency of 3 to 4 cycles, each iteration must wait for the preceding addition to complete.

To achieve maximum throughput (1 vector addition per cycle), unroll across multiple independent accumulator registers:

```nasm
vfmadd231ps ymm0, ymm4, ymmword ptr [rsi]
vfmadd231ps ymm1, ymm5, ymmword ptr [rsi + 32]
vfmadd231ps ymm2, ymm6, ymmword ptr [rsi + 64]
vfmadd231ps ymm3, ymm7, ymmword ptr [rsi + 96]
```

These four FMA instructions operate on independent dependency chains and execute in parallel across available execution ports.

## 3. Register Renaming & Zero-Latency Idioms

The Register Alias Table (RAT) maps architectural registers to physical registers in the physical register file (PRF).

### Zero-Idioms (Zero Execution Cycles)

The register rename stage recognizes specific instruction combinations as identity operations and clears registers without dispatching $\mu$ops to execution ports:
- `xor r32, r32` (e.g. `xor eax, eax`)
- `sub r32, r32` (e.g. `sub eax, eax`)
- `vxorps xmm, xmm, xmm`
- `vpxor ymm, ymm, ymm`

### Partial Register Stalls & False Dependencies

Writing to a sub-register does not automatically zero the rest of the 64-bit register in legacy 8-bit or 16-bit operations:
- `mov al, [rsi]` modifies only bits 0-7 of `rax`, preserving bits 8-63. This creates a false dependency on the prior value of `rax`.
- Always use zero-extending moves: `movzx eax, byte ptr [rsi]`. This breaks the dependency chain on `rax` and writes bits 0-7 while zeroing bits 8-63 in a single cycle.

## 4. Memory Subsystem & Store-to-Load Forwarding (STLF)

When a load immediately follows a store to the same or adjacent memory address, the hardware attempts Store-to-Load Forwarding from the store buffer directly to the load unit without hitting the L1 data cache.

### STLF Failure Conditions

Forwarding stalls by 10 to 20 clock cycles if:
1. Address mismatch: The load reads from an address that partially overlaps the stored region.
2. Size mismatch: A store writes 4 bytes, but a subsequent load attempts to read 8 bytes from the same starting address.
3. Offset misalignment: Reading a sub-element that does not start at the exact base address of the stored block.

Rule: Always match the store width and alignment with downstream consumer load widths.

## 5. Loop Alignment & Branch Predictor Hygiene

- Align loop headers to 32-byte or 64-byte boundaries using `.p2align 5` or `.p2align 4,,15`. This guarantees the first instruction does not cross a fetch block boundary.
- Eliminate branches on random data using `cmov` (Conditional Move) or bitwise masking. Mispredicted branches flush the entire out-of-order execution pipeline, forfeiting 15 to 20 cycles of work.
