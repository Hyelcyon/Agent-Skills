# Extreme Assembly Optimization & Audit Checklist

Senior engineering checklist for verifying cycle-level performance, pipeline saturation, and microarchitectural correctness in mission-critical assembly routines.

## 1. Pipeline & Front-End Hygiene

- DSB uop Cache Sizing: Inner loop body must not exceed 64 to 96 $\mu$ops to avoid front-end decoder fallback.
- Header Alignment: Loop entry points must be aligned to 32 or 64 bytes (`.p2align 5` or `.p2align 6`).
- Zero-Latency Idioms: Register clears must use `xor r32, r32` or `vxorps` rather than immediate moves.
- Partial State: Sub-register memory loads must use `movzx` to break false dependency chains on 64-bit destination registers.

## 2. Execution Port Saturation & Dependency Chains

- Multi-Accumulators: Reduction loops must partition operations across 4 to 8 independent vector registers to cover instruction latency.
- Port Balancing: Interleave vector arithmetic (Port 0/1) with vector shuffles (Port 5) and memory loads (Port 2/3).
- Branchless Predication: Replace data-dependent branches on non-stationary input distributions with `cmov` / `csel` or SIMD bitmasks.

## 3. Memory & Cache Subsystem

- RFO Tax Elimination: Large memory writes exceeding L3 cache capacity must use non-temporal streaming stores (`vmovntdq` / `stnp`) followed by `sfence`.
- Software Prefetch: If software prefetching is used, verify distance formula $D = \lceil \text{Latency}/\text{Cycles} \rceil \times \text{Stride}$.
- Cache Line Isolation: Concurrently modified shared variables and atomic sequence tickets must be isolated to 64-byte aligned slots (`.p2align 6`) to eliminate false sharing.

## 4. ABI & Security Gates

- Stack Invariant: Verify 16-byte stack alignment (`RSP % 16 == 0` or `SP % 16 == 0`) immediately prior to any foreign function call.
- Non-Volatile State: Ensure all callee-saved registers (System V `rbx`, `rsp`, `rbp`, `r12`-`r15`; ARM64 `x19`-`x28`, `d8`-`d15`) are preserved.
- Stack Execution: Verify all object files define `.section .note.GNU-stack,"",@progbits` or `%progbits`.
