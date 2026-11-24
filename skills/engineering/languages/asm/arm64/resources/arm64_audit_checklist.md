# ARM64 Microarchitecture Audit Checklist

Production verification checklist for auditing 64-bit ARM assembly implementations before merging into high-performance systems.

## 1. Register & Frame Disciplines

- SP Alignment: Ensure `sp` is strictly 16-byte aligned before every memory operation using `sp` as a base register.
- Frame Pointer Chaining: Ensure `stp x29, x30, [sp, -16]!` is executed in the prologue and `ldp x29, x30, [sp], 16` in the epilogue of all non-leaf functions.
- Non-Volatile Preservation: Ensure `x19` through `x28` and the lower 64 bits of `v8` through `v15` (`d8`-`d15`) are saved and restored if modified.
- Security Directives: Confirm `paciasp` and `autiasp` are utilized on platforms enforcing Pointer Authentication.

## 2. Memory Subsystem & Concurrency

- Pairwise Loads & Stores: Verify memory access patterns use `ldp` and `stp` (128-bit `q` or 64-bit `x` registers) rather than isolated single loads.
- Acquire-Release: Confirm concurrent publisher-consumer memory points utilize `stlr` and `ldar` rather than plain loads/stores.
- Server Atomics: Confirm ARMv8.1-A Large System Extensions (`ldaddal`, `casal`) are prioritized over legacy `ldxr`/`stxr` loops on high-core-count targets.
- Hardware Prefetcher: Confirm software prefetch instructions (`prfm`) are omitted unless proven necessary for non-strided patterns.

## 3. Vectorization & Control Flow

- Multi-Accumulators: Reduction loops must partition operations across at least 4 independent accumulator registers (`v0`-`v3`) to saturate the execution units.
- Branchless Logic: Replace small conditional branches with conditional select (`csel`, `cinc`, `cset`) or NEON vector masking.
- Loop Alignment: Align inner loop entry points to 16-byte boundaries with `.p2align 4`.
- Security: Confirm `.section .note.GNU-stack,"",%progbits` is defined on Linux ELF targets.
