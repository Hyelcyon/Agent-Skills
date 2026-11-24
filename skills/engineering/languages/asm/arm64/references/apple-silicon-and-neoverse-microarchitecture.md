# ARM64 Microarchitecture: Apple Silicon & ARM Neoverse

Architectural reference for high-throughput execution across ultra-wide out-of-order execution cores (Apple Firestorm, Avalanche, M-series) and enterprise cloud server cores (ARM Neoverse N1, N2, V1, V2).

## 1. Ultra-Wide Superscalar Front-End & Execution Engines

Modern ARM64 cores feature some of the widest execution pipelines in commercial computing:
- Apple Silicon (M1-M4): 8-wide instruction decode, 600+ instruction Reorder Buffer (ROB) capacity, and up to 14 execution ports.
- ARM Neoverse V2: 8-wide decode, 512-entry ROB, quad 128-bit NEON vector pipelines.

```
Instruction Fetch (32-byte / 8-instruction window)
                    │
                    ▼
          [8-Wide Decode Unit]
                    │
                    ▼
          [Rename / Dispatch]
                    │
                    ▼
      [Reorder Buffer (ROB 600+)]
   ┌──────┬──────┬──────┬──────┬──────┐
   ▼      ▼      ▼      ▼      ▼      ▼
[ALU 0] [ALU 1] [ALU 2] [ALU 3] [FP 0] [FP 1] ...
```

### The Starvation Problem

On an 8-wide decode engine, a tiny 3-instruction loop starves the execution units. The CPU dispatches all 3 instructions in less than half a clock cycle, leading to front-end bubbles.

Senior Solution: Unroll loops 4x to 8x to provide sufficient independent instructions to saturate the dispatch window and fill the massive ROB.

## 2. Load/Store Pair (`LDP` / `STP`) Scheduling

Apple Silicon and Neoverse cores feature massive memory bandwidth with multiple dedicated Load/Store Units (LSUs).

### The Invariant

Always prefer Load/Store Pair (`ldp` / `stp`) over individual loads (`ldr` / `str`):

```asm
ldp q0, q1, [x0], #32
ldp q2, q3, [x0], #32
```

- Scheduling 128-bit `q` pairs together maximizes Load/Store Queue (LSQ) merging.
- Emits fewer total instructions, saving decode and dispatch bandwidth.
- Feeds memory requests directly into cache line fill buffers with minimal latency.

## 3. Multi-Accumulator Pipelining

Because vector floating-point fused multiply-accumulate (`fmla.4s`) has a latency of 3 to 4 clock cycles, accumulating into a single vector register stalls execution on read-after-write (RAW) dependencies.

Always maintain 4 independent accumulator streams:

```asm
fmla v0.4s, v4.4s, v8.4s
fmla v1.4s, v5.4s, v9.4s
fmla v2.4s, v6.4s, v10.4s
fmla v3.4s, v7.4s, v11.4s
```

These 4 independent operations execute concurrently across available floating-point pipelines, achieving peak theoretical throughput.

## 4. Large System Extensions (LSE) Atomics

On high-core-count servers (AWS Graviton 3/4, Ampere Altra), legacy load-linked/store-conditional loops (`ldxr` / `stxr`) degrade severely under heavy thread contention due to cache line bouncing and repeated monitor invalidations.

ARMv8.1-A introduced single-instruction Large System Extensions (LSE):

| Primitive | Legacy ARMv8.0-A Loop | Modern ARMv8.1-A+ LSE |
| :--- | :--- | :--- |
| Atomic Add | `ldxr` + `add` + `stxr` + retry loop | `ldaddal w1, w2, [x0]` |
| Compare-and-Swap | `ldaxr` + `cmp` + `stlxr` + retry loop | `casal w1, w2, [x0]` |
| Atomic Swap | `ldxr` + `stxr` + retry loop | `swpal w1, w2, [x0]` |
| Bitwise OR / AND | `ldxr` + `orr`/`and` + `stxr` | `ldsetal` / `ldclral` |

LSE instructions execute directly at the memory controller or L3 cache level, eliminating cache-line ping-pong between CPU cores.

## 5. Pointer Authentication (PAC) & Branch Target Identification (BTI)

Modern ARM64 binaries enforce hardware-level return-oriented programming (ROP) and jump-oriented programming (JOP) mitigation:
- PAC: Signs the return address in `x30` using a secret key and stack pointer as context (`paciasp` in prologue, `autiasp` in epilogue).
- BTI: Enforces that indirect branch targets (`br`, `blr`) must land directly on a `bti` instruction, preventing arbitrary code redirection.

## 6. Data-Independent Timing (DIT)

Certain ARM64 operations vary in cycle latency based on operand values (e.g. division, floating-point denormals, vector rotates). In cryptographic routines, this exposes side-channel timing vulnerabilities.

Enable constant-time execution mode:

```asm
msr dit, #1
```

This instructs the core to execute instructions with fixed worst-case latency regardless of register contents.
