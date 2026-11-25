---
name: asm
description: Use when authoring, reviewing, or micro-optimizing high-performance assembly code across x86-64 and ARM64/Apple Silicon architectures, eliminating pipeline stalls, saturating execution ports, implementing SIMD/AVX-512/NEON vector kernels, lock-free atomics, or non-temporal cache-bypassing streaming.
---

# Extreme Assembly Microarchitecture & Performance Engineering

Senior engineering standard for cycle-perfect, microarchitecture-saturating assembly software across modern superscalar out-of-order processors (Intel, AMD, Apple Silicon, ARM Neoverse).

## When to Use
- Micro-optimizing high-throughput hot paths, inner loops, or cryptographic and linear algebra kernels.
- Saturating superscalar execution ports and eliminating serial read-after-write (RAW) dependency stalls.
- Implementing branchless character classification, UTF-8 parsing, and vector table lookups (`vpshufb` / `tbl`).
- Bypassing L1/L2/L3 caches and eliminating Read-For-Ownership (RFO) bus penalties via non-temporal streaming stores.
- Eliminating cache-line false sharing and designing wait-free MPMC concurrency primitives.
- Auditing assembly implementations for uop cache constraints, port balancing, and ABI invariants.

## When NOT to Use
- High-level business logic, web services, or standard application code where compilers achieve optimal throughput.
- Rapid scripting tasks suited for Python or shell.

---

## 5-Phase Agent Operational Protocol

```
Phase 1: Microarchitecture & Port Topology Profiling (Intel/AMD/Apple Silicon execution ports, uop cache)
Phase 2: Cache Subsystem & Memory Hierarchy Boundary Definition (L1/L2/L3, WC buffers, false sharing)
Phase 3: Cycle-Level Schedule Formulation & Multi-Accumulator Widening (Latency vs Throughput)
Phase 4: Vector Supercomputing & Branchless Predication (AVX-512/NEON, vpshufb/tbl, cmov/csel)
Phase 5: Cycle-Accurate Verification & Disassembly Audit (PMU, Linux perf, cycle counters)
```

### Phase 1: Microarchitecture & Port Topology Profiling
Identify hardware dispatch ports (e.g. Intel Golden Cove 12 ports, Apple Firestorm 14 ports) and uop cache limits. Keep critical loops under 64 to 96 $\mu$ops to prevent dropping into legacy decoders.

### Phase 2: Cache Subsystem & Memory Hierarchy Boundaries
- Isolate shared atomic variables onto dedicated 64-byte aligned lines (`.p2align 6`) to eliminate cache line ping-pong.
- For bulk writes exceeding L3 cache capacity, use non-temporal streaming stores (`vmovntdq` / `stnp`) followed by `sfence` to bypass Read-For-Ownership (RFO) bus penalties.

### Phase 3: Cycle-Level Schedule Formulation & Multi-Accumulators
Never accumulate reduction loops into a single register. Calculate required accumulators:
$$\text{Accumulators} = \text{Instruction Latency} \times \text{Issue Rate}$$
Unroll loops across 4 to 8 independent vector registers and interleave arithmetic, vector shuffles, and loads.

### Phase 4: Vector Supercomputing & Branchless Predication
- Replace data-dependent branches on non-stationary distributions with conditional moves (`cmov` / `csel`) or SIMD masks (`vpmovmskb`).
- Execute parallel in-register table lookups using `vpshufb` or `tbl` to decode nibbles without memory reads.

### Phase 5: Cycle-Accurate Verification & Disassembly Audit
Benchmark using serialized hardware cycle counters (`cpuid` + `rdtsc` or `cntvct_el0`) and inspect execution with Linux `perf`:
```bash
perf stat -e cycles,instructions,uops_issued.any,uops_executed.thread,frontend_retired.dsb_miss ./bin/app
```

---

## Fatal Mistakes Never to Make & Prohibited Anti-Patterns

- ❌ Issuing non-temporal streaming stores (`vmovntdq`) on unaligned destination pointers without a 32-byte alignment peel prologue (causes hardware `#GP` faults).
- ❌ Performing scalar operations on vector accumulators before horizontal reduction on ARM64 (writing `s0` silently zeroes `v0[127:32]`, discarding 75% of vector lanes).
- ❌ Serial reduction accumulation into a single register (throttles execution to instruction latency).
- ❌ Aggressive unrolling (>8x) that exceeds the uop cache (DSB) and forces legacy decoder fallback.
- ❌ Putting concurrently modified atomic counters in the same 64-byte cache line (causes false sharing).
- ❌ Performing bulk writes without non-temporal stores (incurs 50% RFO memory bus penalty).
- ❌ Partial register writes (`mov al, [rsi]`) instead of zero-extending loads (`movzx eax, byte ptr [...]`).
- ❌ Violating 16-byte stack alignment immediately prior to any `call` instruction.

---

## Architecture Sub-Skills
- Modern x86-64 Senior Assembly: [x86-64/SKILL.md](./x86-64/SKILL.md)
- ARM64 (AArch64) Senior Assembly: [arm64/SKILL.md](./arm64/SKILL.md)

## Specialized References & Documentation
- Microarchitectural Port Saturation & Scheduling: [references/microarchitectural-execution-port-saturation.md](./references/microarchitectural-execution-port-saturation.md)
- SIMD Vector Supercomputing & SWAR Algorithms: [references/simd-vector-supercomputing-and-swar.md](./references/simd-vector-supercomputing-and-swar.md)
- Cache Hierarchy & Non-Temporal Streaming: [references/cache-hierarchy-and-non-temporal-streaming.md](./references/cache-hierarchy-and-non-temporal-streaming.md)
- Lock-Free Concurrency & Memory Fences: [references/lock-free-concurrency-and-memory-fences.md](./references/lock-free-concurrency-and-memory-fences.md)
- The Zen of Assembly (God-Tier Critique): [references/the-zen-of-assembly-god-tier-critique.md](./references/the-zen-of-assembly-god-tier-critique.md)

## Resources & Examples
- Cycle-Accurate Benchmark Harness in C: [resources/asm_benchmark_harness.c](./resources/asm_benchmark_harness.c)
- CPU Execution Port Saturation Matrix: [resources/cpu_port_saturation_matrix.json](./resources/cpu_port_saturation_matrix.json)
- Extreme Assembly Optimization Checklist: [resources/extreme_optimization_checklist.md](./resources/extreme_optimization_checklist.md)
- Multi-Kernel Benchmark Makefile: [resources/Makefile](./resources/Makefile)
- AVX2 Branchless ASCII/UTF-8 Validator: [examples/avx2_fast_utf8_ascii_validator.s](./examples/avx2_fast_utf8_ascii_validator.s)
- Non-Temporal Streaming Cache-Bypass Copy: [examples/non_temporal_streaming_copy.s](./examples/non_temporal_streaming_copy.s)
- Branchless Integer to ASCII (SWAR): [examples/branchless_itoa_swar.s](./examples/branchless_itoa_swar.s)
- Wait-Free MPMC Atomic Slot Reservation: [examples/wait_free_mpmc_bounded_slot.s](./examples/wait_free_mpmc_bounded_slot.s)
- NEON 4x4 Float Matrix Transpose: [examples/neon_swar_bit_matrix_transpose.s](./examples/neon_swar_bit_matrix_transpose.s)
