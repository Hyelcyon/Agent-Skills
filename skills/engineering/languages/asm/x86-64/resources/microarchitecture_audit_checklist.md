# x86-64 Microarchitecture Audit Checklist

Production verification checklist for auditing 64-bit x86 assembly implementations before merging into high-performance systems.

## 1. Register & Stack Integrity

- Stack Alignment: Ensure `rsp % 16 == 0` immediately before any `call` instruction.
- Callee Preservation: Ensure `rbx`, `rsp`, `rbp`, `r12`, `r13`, `r14`, `r15` are saved and restored across calls. On Windows, additionally preserve `rsi`, `rdi`, and the low 128 bits of `xmm6`-`xmm15`.
- Shadow Space: On Windows x64 ABI, verify that callers allocate 32 bytes of shadow space immediately prior to each `call`.

## 2. Pipeline & Execution Efficiency

- Register Zeroing: Verify all register clears use `xor r32, r32` or `vxorps`.
- Partial Registers: Verify all sub-register loads use zero-extension (`movzx`) to eliminate false dependencies.
- AVX Clean-up: Verify `vzeroupper` is issued prior to exiting any function modifying YMM or ZMM registers.
- Store-to-Load Forwarding: Verify memory read sizes match the write size and base alignment to prevent forwarding stalls.

## 3. Vectorization & Control Flow

- Multi-Accumulators: Reduction loops must partition operations across at least 2 to 4 independent accumulator registers.
- Loop Alignment: Inner loop headers must be aligned using `.p2align 5` or `.p2align 4,,15`.
- Branch Predictor: Replace unpredictable data-dependent branches with `cmov` or arithmetic masks.
- Security: Confirm `.section .note.GNU-stack,"",@progbits` is defined on Linux ELF targets.
