# ARM64 (AArch64) Architecture & AAPCS64 Calling Convention

Comprehensive architectural reference for 64-bit ARM execution (ARMv8-A / ARMv9-A), Procedure Call Standard (AAPCS64), register usage, and stack discipline.

## 1. Register Architecture & Hardware Roles

AArch64 defines thirty-one 64-bit general-purpose registers (`x0` through `x30`), a dedicated Stack Pointer (`sp`), a Program Counter (`pc`), thirty-two 128-bit vector/FP registers (`v0` through `v31`), and a Zero Register (`xzr` / `wzr`).

| Register | 32-bit View | AAPCS64 Classification | Architectural Role |
| :--- | :--- | :--- | :--- |
| `x0`-`x7` | `w0`-`w7` | Caller-Saved (Volatile) | Parameter Passing & Return Values (`x0`-`x1`) |
| `x8` | `w8` | Caller-Saved | Indirect Result Location Pointer (Struct Returns) |
| `x9`-`x15` | `w9`-`w15` | Caller-Saved (Volatile) | Scratch / Temporary Registers |
| `x16`-`x17` | `w16`-`w17` | Caller-Saved (Volatile) | Intra-Procedure-Call Coroutine / PLT Veneer |
| `x18` | `w18` | Platform Dependent | Reserved for Platform (Shadow Stack / TLS) |
| `x19`-`x28` | `w19`-`w28` | Callee-Saved (Non-Volatile) | Must be preserved across subroutines |
| `x29` | `w29` | Callee-Saved | Frame Pointer (FP) |
| `x30` | `w30` | Caller-Saved | Link Register (LR) holding return address |
| `sp` | `wsp` | Dedicated Hardware | Stack Pointer (Must remain 16-byte aligned) |
| `xzr` | `wzr` | Hardwired Zero | Reads as 0, writes are discarded |
| `v0`-`v7` | `d0`-`d7`, `s0`-`s7` | Caller-Saved | FP/SIMD Parameter Passing & Return Values |
| `v8`-`v15` | `d8`-`d15` | Callee-Saved | Only bottom 64 bits (`d8`-`d15`) are preserved |
| `v16`-`v31` | `d16`-`d31` | Caller-Saved | Scratch / Vector Temporary Registers |

## 2. Function Prologue, Epilogue & Frame Chaining

In AArch64, non-leaf functions must create a record frame preserving the previous Frame Pointer (`x29`) and the return Link Register (`x30`) to allow stack unwinders, debuggers, and profilers to traverse the stack call graph.

### Standard Prologue & Epilogue

```asm
stp x29, x30, [sp, -16]!
mov x29, sp

...

ldp x29, x30, [sp], 16
ret
```

The pre-indexed store pair (`stp`) decrements `sp` by 16 bytes and stores both registers in a single instruction. The post-indexed load pair (`ldp`) restores both registers and reclaims the stack space.

## 3. Hardware Stack Alignment Invariant

ARMv8 hardware enforces a strict alignment check on the Stack Pointer:
- Whenever `sp` is used as a base register in a memory access (`ldr`, `str`, `ldp`, `stp`), its value MUST be a multiple of 16 bytes (128 bits).
- An unaligned access using `sp` raises an Alignment Fault exception directly at the CPU core level.

To allocate local variable stack space while maintaining 16-byte alignment:

```asm
stp x29, x30, [sp, -32]!
mov x29, sp
str x19, [sp, 16]

...

ldr x19, [sp, 16]
ldp x29, x30, [sp], 32
ret
```

## 4. PC-Relative Addressing (ADRP + ADD)

Because ARM64 instructions are fixed at 32-bit width, loading a full 64-bit absolute address directly in one instruction is impossible. AArch64 uses page-relative addressing:

```asm
adrp x0, target_symbol
add  x0, x0, :lo12:target_symbol
```

- `adrp` computes the base address of the 4KB page containing `target_symbol` relative to the current Program Counter, with a range of $\pm 4$ GB.
- `:lo12:` extracts the lower 12 bits (page offset) to form the exact 64-bit virtual memory pointer.
