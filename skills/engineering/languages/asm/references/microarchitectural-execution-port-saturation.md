# Microarchitectural Execution Port Saturation & Cycle-Level Scheduling

Deep technical reference for structuring high-performance assembly code to achieve theoretical maximum instruction dispatch, zero port contention, and cycle-perfect throughput on modern superscalar out-of-order processors.

## 1. Execution Port Topology: Intel, AMD, and Apple Silicon

Modern CPUs map execution units (ALUs, vector units, branch units, load/store units) to discrete physical dispatch ports fed by a centralized reservation station (RS) or distributed scheduler queues.

### Intel Golden Cove / Raptor Cove Port Mapping

Intel Core architectures (12th–14th Gen) feature 12 dispatch ports:
- Port 0: Integer ALU, Vector FMA/ALU, Shift, Branch
- Port 1: Integer ALU, Vector FMA/ALU, Slow Vector
- Port 5: Integer ALU, Vector Shuffle, Fast Byte/Word SIMD
- Port 6: Integer ALU, Branch, Shift
- Port 2 & 3: Load pipelines (reads up to 64 bytes/cycle total)
- Port 7 & 8: Store Address Generation Units (AGU)
- Port 4 & 9: Store Data Units (writes up to 64 bytes/cycle total)

### AMD Zen 4 / Zen 5 Execution Topology

AMD Zen architectures feature decoupled integer (4 ALU + 2 AGU) and floating-point/vector schedulers:
- 4 Integer ALUs (capable of 4 integer operations per cycle)
- 3 Load/Store AGUs (up to 3 memory operations per cycle: 2 loads + 1 store or 1 load + 2 stores)
- 4 Vector/SIMD execution pipes: 2 FMA (512-bit in Zen 4/5) + 2 Vector ALU/Shuffle

### Apple Silicon (M1-M4 / Firestorm / Avalanche) Topology

Apple Silicon features an ultra-wide 8-wide decode front-end with 14 execution ports:
- Ports 0-5: 6 Integer ALUs (up to 6 integer instructions/cycle)
- Ports 6-9: 4 Vector/FP units (4 independent 128-bit NEON execution pipes)
- Ports 10-11: 2 Load units (2 $\times$ 16-byte reads/cycle)
- Ports 12-13: 2 Store units (2 $\times$ 16-byte writes/cycle)

## 2. Port Saturation & Instruction Interleaving

When a hot loop contains instructions that target the same execution port, execution serializes even if there are no register dependencies:

```nasm
vpshufb ymm0, ymm1, ymm10
vpshufb ymm2, ymm3, ymm10
vpshufb ymm4, ymm5, ymm10
```

On Intel, `vpshufb` can only execute on **Port 5**. Issuing three consecutive shuffle instructions forces a 3-cycle execution stall.

### The Interleaving Rule

Mix vector arithmetic (Port 0/1) with vector shuffles (Port 5) and memory loads (Port 2/3):

```nasm
vmovups ymm6, ymmword ptr [rsi]
vpshufb ymm0, ymm1, ymm10
vfmadd231ps ymm8, ymm0, ymm6
```

In this interleaved schedule, the load, the shuffle, and the FMA execute simultaneously within the exact same clock cycle.

## 3. Breaking Register Dependency Chains (Latency vs. Throughput)

Every instruction has a physical latency (cycles until result is ready) and reciprocal throughput (cycles before another instance can issue):
- AVX-512 / AVX2 `vfmadd231ps`: Latency = 4 cycles, Reciprocal Throughput = 0.5 cycles (2 per cycle across Port 0 and Port 1).

### Theoretical Maximum Calculation

To achieve the maximum throughput of 2 FMAs per cycle on a pipeline with 4-cycle latency:
$$\text{Minimum Accumulators} = \text{Latency} \times \text{Throughput} = 4 \times 2 = 8 \text{ independent streams}$$

If you accumulate into fewer than 8 independent vector registers across an unrolled loop, the execution engine starves while waiting for prior iteration results to retire, dropping performance to a fraction of peak FLOPS.

## 4. The Front-End $\mu$op Cache (DSB) Constraint

While widening loop unrolling to 8x or 16x maximizes accumulator count, exceeding the capacity of the Decoded Stream Buffer ($\mu$op cache) causes fatal front-end degradation:
- The DSB holds approximately 1,500 to 4,000 $\mu$ops, organized into 6-$\mu$op cache lines.
- If an unrolled loop spans across too many 64-byte instruction blocks, the CPU drops out of the DSB and falls back to the legacy MITE decoders.
- Legacy decoding is capped at 4 instructions per cycle, regardless of back-end width.

Golden Invariant: Size inner loops between 64 and 128 $\mu$ops, unrolling 4x to 8x with 4 to 8 independent accumulators, and align loop headers to 32 or 64 bytes (`.p2align 5` or `.p2align 6`).
