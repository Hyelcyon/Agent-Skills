---
name: x86-64
description: Use when authoring, optimizing, or reviewing x86-64 assembly language, NASM or GNU Assembler (GAS) syntax, System V AMD64 or Microsoft x64 ABI calling conventions, AVX2/AVX-512 SIMD vectorization, inline assembly (__asm__), or low-level binary runtime routines.
---

# Modern x86-64 Assembly Senior Engineering

Senior standards for 64-bit x86 architecture, NASM/GAS assembly, System V AMD64 and Windows x64 ABI compliance, AVX2/AVX-512 SIMD vectorization, uop cache optimization, and stack alignment invariants.

## When to Use
- Writing high-throughput x86-64 assembly kernels using NASM or GNU Assembler (GAS).
- Optimizing inner loops using AVX2 or AVX-512 vector pipelines and multi-accumulator patterns.
- Eliminating branch mispredictions with branchless conditional moves (`cmov`).
- Authoring GCC/Clang extended inline assembly (`__asm__ volatile`) or MSVC intrinsics.
- Implementing custom runtime entry points, thread context switches, or spinlocks.
- Auditing assembly output for 16-byte stack alignment, uop cache sizing, and ABI register invariants.

## When NOT to Use
- High-level systems programming where C++20 or Rust zero-cost abstractions suffice (use `cpp` or `rust`).
- Pure ARM64 / AArch64 targets (use `arm64`).
- Rapid scripting tasks suited for Python or shell.

---

## 5-Phase Agent Operational Protocol

```
Phase 1: Toolchain Standard & Target ABI Profiling (NASM, GAS, System V vs Windows x64)
Phase 2: Stack Frame & 16-Byte Alignment Boundary Enforcement (RSP % 16 == 0 before call)
Phase 3: Register Allocation & Callee-Saved State Preservation (RBX, RBP, R12-R15)
Phase 4: SIMD Vectorization & Microarchitectural Optimization (AVX2/AVX-512, vzeroupper, uop cache)
Phase 5: Automated Verification & Disassembly Validation (objdump, GDB, test suite)
```

### Phase 1: Toolchain Standard & Target ABI Profiling
Determine assembler syntax (Intel vs AT&T) and target OS ABI:
- System V AMD64 (Linux, macOS, BSD): Arguments pass in `rdi`, `rsi`, `rdx`, `rcx`, `r8`, `r9`.
- Microsoft x64 (Windows): Arguments pass in `rcx`, `rdx`, `r8`, `r9`. Mandatory 32-byte caller shadow space.

### Phase 2: Stack Frame & 16-Byte Alignment Boundaries
Enforce the fundamental hardware alignment invariant: `rsp` must be 16-byte aligned immediately before issuing a `call` instruction. Allocate stack space in multiples of 16 bytes:
```nasm
push rbp
mov  rbp, rsp
sub  rsp, 32
call foreign_function
leave
ret
```

### Phase 3: Register Allocation & Callee-Saved State Preservation
Preserve all non-volatile registers across function boundaries. In System V AMD64, preserve `rbx`, `rsp`, `rbp`, `r12`, `r13`, `r14`, and `r15`. On Windows x64, additionally preserve `rsi`, `rdi`, and the lower 128 bits of `xmm6` through `xmm15`.

### Phase 4: SIMD Vectorization & Microarchitectural Optimization
- Zero registers using `xor r32, r32` or `vxorps xmm0, xmm0, xmm0` to avoid false dependency stalls.
- Break serial dependency chains in reduction loops by unrolling across 2 to 4 independent accumulator registers.
- Whenever YMM or ZMM registers are modified, issue `vzeroupper` prior to executing foreign calls or issuing `ret` to prevent AVX-SSE transition penalties:
```nasm
vzeroupper
ret
```

### Phase 5: Automated Verification & Disassembly Validation
Assemble with strict warnings and inspect generated object files:
```bash
nasm -f elf64 -Werror src/routine.asm -o bin/routine.o
objdump -d -M intel bin/routine.o
```

---

## Prohibited Anti-Patterns

- ❌ Violating 16-byte stack alignment prior to `call` instructions (triggers `#GP` in aligned SIMD).
- ❌ Clobbering callee-saved registers (`rbx`, `rbp`, `r12`-`r15`) without restoring them before `ret`.
- ❌ Omitting `vzeroupper` after executing 256-bit or 512-bit AVX instructions before calling legacy code.
- ❌ Using `mov rax, 0` instead of `xor eax, eax` (incurs code bloat and register dependency stalls).
- ❌ Serializing loop accumulation into a single vector register instead of using multi-accumulators.
- ❌ Emitting object files without `.note.GNU-stack` (leads to insecure executable stack allocations).

---

## References & Documentation
- x86-64 Architecture & ABI Standards: [references/x86-64-architecture-and-abi.md](./references/x86-64-architecture-and-abi.md)
- Microarchitecture & Pipeline Optimization: [references/microarchitecture-and-pipeline-optimization.md](./references/microarchitecture-and-pipeline-optimization.md)
- SIMD AVX Vectorization & Optimization: [references/simd-avx-optimization.md](./references/simd-avx-optimization.md)
- Inline Assembly & Compiler Intrinsics: [references/inline-asm-and-compiler-intrinsics.md](./references/inline-asm-and-compiler-intrinsics.md)
- Senior Engineer Critique & Anti-Patterns: [references/senior-engineer-critique-and-antipatterns.md](./references/senior-engineer-critique-and-antipatterns.md)

## Resources & Examples
- Production Assembly Makefile: [resources/Makefile](./resources/Makefile)
- ELF64 Linker Script: [resources/linker_script.ld](./resources/linker_script.ld)
- NASM Entry Point Template: [resources/nasm_entry_template.asm](./resources/nasm_entry_template.asm)
- Microarchitecture Audit Checklist: [resources/microarchitecture_audit_checklist.md](./resources/microarchitecture_audit_checklist.md)
- AVX2 Vectorized String Length: [examples/x86_64_sysv_fast_string_length.s](./examples/x86_64_sysv_fast_string_length.s)
- AVX2 Multi-Accumulator FMA Kernel: [examples/avx2_multi_accumulator_gemm.s](./examples/avx2_multi_accumulator_gemm.s)
- Atomic Spinlock Implementation: [examples/x86_64_atomic_spinlock.s](./examples/x86_64_atomic_spinlock.s)
- Branchless Binary Search (cmov): [examples/branchless_binary_search.s](./examples/branchless_binary_search.s)
- Fenced RDTSC Benchmarking Harness: [examples/inline_asm_rdtsc_benchmark.c](./examples/inline_asm_rdtsc_benchmark.c)
