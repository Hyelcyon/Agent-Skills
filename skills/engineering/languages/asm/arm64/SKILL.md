---
name: arm64
description: Use when authoring, optimizing, or reviewing ARM64 (AArch64) assembly language, AAPCS64 calling conventions, Apple Silicon or ARMv8/v9-A instructions, NEON vectorization, inline assembly, or low-level firmware and kernel routines.
---

# ARM64 (AArch64) Assembly Senior Engineering

Senior standards for 64-bit ARM architecture (ARMv8-A / ARMv9-A), Apple Silicon and Neoverse wide out-of-order execution, AAPCS64 ABI compliance, NEON vectorization, and stack frame invariants.

## When to Use
- Authoring high-throughput ARM64 assembly kernels for Apple Silicon or Linux AArch64.
- Vectorizing computational loops using 128-bit NEON, SVE2, or multi-accumulator patterns.
- Saturating ultra-wide execution pipelines using `ldp`/`stp` vector pairs and unrolled loops.
- Implementing low-latency concurrency primitives with ARMv8.1-A LSE atomics or acquire-release semantics (`ldar`/`stlr`).
- Structuring AAPCS64 compliant function frames with 16-byte stack pointer alignment and PAC/BTI security.
- Writing GNU C inline assembly with explicit memory barriers.

## When NOT to Use
- Applications targeted exclusively for x86-64 platforms (use `x86-64`).
- High-level systems programming where Rust or modern C++ standard concurrency libraries suffice.
- Web or backend services where compiled higher-level languages provide necessary throughput.

---

## 5-Phase Agent Operational Protocol

```
Phase 1: Architecture Standard & ABI Profiling (ARMv8.0-A vs ARMv9-A, Apple Silicon vs Linux)
Phase 2: Frame Pointer & 16-Byte Stack Alignment Verification (SP quadword alignment)
Phase 3: Register Allocation & Callee-Saved State Protection (X19-X28, D8-D15)
Phase 4: SIMD NEON Vectorization & Pipeline Optimization (Multi-accumulator FMLA, LDP/STP)
Phase 5: Memory Barrier Verification & Atomic Execution (LSE atomics, LDAR/STLR, DMB ISH)
```

### Phase 1: Architecture Standard & ABI Profiling
Determine target platform ABI (Linux AAPCS64 vs macOS Darwin). Darwin mandates strict pointer authentication (PAC) on Apple Silicon and reserves `x18`. Integer parameters pass in `x0`-`x7`; return values pass in `x0`-`x1`.

### Phase 2: Frame Pointer & 16-Byte Stack Alignment
Enforce the hardware SP alignment constraint: `sp` must be 16-byte aligned whenever used as a memory base pointer. Non-leaf routines must establish frame pointer chaining using pre-indexed store pair:
```asm
stp x29, x30, [sp, -16]!
mov x29, sp
...
ldp x29, x30, [sp], 16
ret
```

### Phase 3: Register Allocation & Callee-Saved State Protection
Preserve callee-saved registers across subroutine calls:
- General-purpose: `x19` through `x28`.
- SIMD / Floating-Point: Lower 64 bits (`d8`-`d15`) of vector registers `v8` through `v15`.

### Phase 4: SIMD NEON Vectorization & Pipeline Optimization
- On wide-issue cores (Apple Silicon 8-wide, Neoverse V2 8-wide), unroll loops 4x to 8x and accumulate across at least 4 independent vector registers (`v0`-`v3`) to break serial RAW dependency stalls.
- Group memory transfers into 128-bit `q` or 64-bit `x` pairs (`ldp`/`stp`) to maximize Load/Store Queue merging.

### Phase 5: Memory Barrier Verification & Atomic Execution
- Never rely on sequential consistency on ARM. Protect shared data with explicit hardware acquire-release primitives:
```asm
stlr w1, [x0]
ldar w2, [x0]
```
- In high-contention multi-core server environments, prioritize single-instruction Large System Extensions (`ldaddal`, `casal`) over legacy `ldxr`/`stxr` loops.

---

## Prohibited Anti-Patterns

- ❌ Violating 16-byte `sp` alignment (raises immediate hardware Alignment Fault exception).
- ❌ Clobbering callee-saved registers (`x19`-`x28` or `d8`-`d15`) without preserving them on the stack.
- ❌ Single-accumulator loop reduction (serializes execution to instruction latency).
- ❌ Omitting frame record creation (`stp x29, x30, [sp, -16]!`) in non-leaf functions (breaks stack unwinding).
- ❌ Omitting memory barriers (`dmb ish`) or acquire-release pairs when sharing state across CPU cores.
- ❌ Indiscriminate use of software prefetching (`prfm`) that disrupts aggressive hardware stream prefetchers.

---

## References & Documentation
- ARM64 Architecture & AAPCS64 ABI Standards: [references/arm64-aarch64-architecture-and-abi.md](./references/arm64-aarch64-architecture-and-abi.md)
- Apple Silicon & Neoverse Microarchitecture: [references/apple-silicon-and-neoverse-microarchitecture.md](./references/apple-silicon-and-neoverse-microarchitecture.md)
- NEON Vectorization & SVE2 Deep Dive: [references/neon-vectorization-and-sve.md](./references/neon-vectorization-and-sve.md)
- ARM64 Memory Model & Barrier Synchronization: [references/arm64-memory-model-and-barriers.md](./references/arm64-memory-model-and-barriers.md)
- Senior Engineer Critique & Anti-Patterns: [references/senior-engineer-critique-and-antipatterns.md](./references/senior-engineer-critique-and-antipatterns.md)

## Resources & Examples
- Cross-Compilation Makefile: [resources/Makefile](./resources/Makefile)
- AArch64 ELF Linker Script: [resources/arm64_linker_script.ld](./resources/arm64_linker_script.ld)
- GAS ARM64 Assembly Starter Template: [resources/arm64_starter_template.s](./resources/arm64_starter_template.s)
- ARM64 Microarchitecture Audit Checklist: [resources/arm64_audit_checklist.md](./resources/arm64_audit_checklist.md)
- NEON Vectorized Dot Product: [examples/arm64_vector_dot_product.s](./examples/arm64_vector_dot_product.s)
- Multi-Accumulator NEON FMA Kernel: [examples/arm64_multi_accumulator_fma.s](./examples/arm64_multi_accumulator_fma.s)
- Atomic Ticket Lock Implementation: [examples/arm64_atomic_ticket_lock.s](./examples/arm64_atomic_ticket_lock.s)
- Large System Extensions (LSE) Atomics: [examples/arm64_lse_atomic_counter.s](./examples/arm64_lse_atomic_counter.s)
- Lock-Free Barrier Channel in C: [examples/arm64_inline_asm_barrier.c](./examples/arm64_inline_asm_barrier.c)
