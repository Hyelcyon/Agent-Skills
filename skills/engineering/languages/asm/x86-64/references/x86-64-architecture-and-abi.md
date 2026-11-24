# x86-64 Architecture & Application Binary Interfaces (ABI)

Comprehensive architectural reference for 64-bit x86 execution, calling conventions, stack alignment invariants, and register state preservation.

## 1. Register Architecture & Classification

The x86-64 architecture provides sixteen 64-bit general-purpose registers along with thirty-two SIMD vector registers (ZMM0-ZMM31 in AVX-512; YMM0-YMM15 in AVX2; XMM0-XMM15 in standard SSE).

| Register | 32-bit Subregister | 16-bit | 8-bit Low | System V AMD64 Role | Microsoft x64 Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `rax` | `eax` | `ax` | `al` | 1st Return Value | 1st Return Value |
| `rdx` | `edx` | `dx` | `dl` | 3rd Argument / 2nd Return | 2nd Argument |
| `rcx` | `ecx` | `cx` | `cl` | 4th Argument | 1st Argument |
| `rbx` | `ebx` | `bx` | `bl` | Callee-Saved | Callee-Saved |
| `rsi` | `esi` | `si` | `sil` | 2nd Argument | Callee-Saved |
| `rdi` | `edi` | `di` | `dil` | 1st Argument | Callee-Saved |
| `rbp` | `ebp` | `bp` | `bpl` | Callee-Saved (Frame Pointer) | Callee-Saved (Frame Pointer) |
| `rsp` | `esp` | `sp` | `spl` | Stack Pointer | Stack Pointer |
| `r8` | `r8d` | `r8w` | `r8b` | 5th Argument | 3rd Argument |
| `r9` | `r9d` | `r9w` | `r9b` | 6th Argument | 4th Argument |
| `r10` | `r10d` | `r10w` | `r10b` | Caller-Saved (Static Chain) | Caller-Saved |
| `r11` | `r11d` | `r11w` | `r11b` | Caller-Saved (Scratch) | Caller-Saved |
| `r12` | `r12d` | `r12w` | `r12b` | Callee-Saved | Callee-Saved |
| `r13` | `r13d` | `r13w` | `r13b` | Callee-Saved | Callee-Saved |
| `r14` | `r14d` | `r14w` | `r14b` | Callee-Saved | Callee-Saved |
| `r15` | `r15d` | `r15w` | `r15b` | Callee-Saved | Callee-Saved |

## 2. ABI Calling Conventions

### System V AMD64 ABI (Linux, macOS, FreeBSD)

- Integer Arguments: `rdi`, `rsi`, `rdx`, `rcx`, `r8`, `r9`. Subsequent arguments pass on the stack in right-to-left order.
- Floating-Point Arguments: `xmm0` through `xmm7`.
- Return Values: `rax` (primary integer/pointer), `rdx` (secondary integer), `xmm0`/`xmm1` (floating-point).
- Callee-Saved Registers: `rbx`, `rsp`, `rbp`, `r12`, `r13`, `r14`, `r15`.
- Red Zone: A 128-byte area below `rsp` reserved for leaf function scratch allocation without moving `rsp`. Signal handlers and interrupt routines must not clobber this region, but compilers disable it for kernel code (`-mno-red-zone`).

### Microsoft x64 Calling Convention (Windows)

- Integer Arguments: `rcx`, `rdx`, `r8`, `r9`. Subsequent arguments pass on the stack.
- Floating-Point Arguments: `xmm0`, `xmm1`, `xmm2`, `xmm3`.
- Shadow Space (Home Space): The caller MUST allocate 32 bytes (4 quadwords) of stack space immediately before issuing `call`, regardless of parameter count.
- Callee-Saved Registers: `rbx`, `rbp`, `rdi`, `rsi`, `r12`, `r13`, `r14`, `r15`, and the lower 128 bits of `xmm6` through `xmm15`.
- No Red Zone: Any memory below `rsp` is volatile and subject to immediate destruction by OS asynchronous callbacks and debuggers.

## 3. Stack Alignment Invariants

Both System V and Windows ABI mandate strict 16-byte stack alignment:

```
[Incoming RSP % 16 == 8]  <-- The call instruction pushed an 8-byte return address
  push rbp                 <-- RSP % 16 == 0
  mov  rbp, rsp
  sub  rsp, 32             <-- Maintain multiple of 16 bytes before any nested call
  ...
  call foreign_function    <-- Outgoing RSP % 16 must equal 0 before call
  ...
  leave
  ret
```

Executing a `call` instruction when `rsp` is not 16-byte aligned triggers fatal faults in standard library functions using aligned SIMD instructions (`movaps`, `vmovaps`).

## 4. Register Zeroing & Dependence Breaking

Zeroing a 32-bit register implicitly zeroes the upper 32 bits of the corresponding 64-bit register and breaks hardware register dependency chains in the out-of-order execution engine:

```nasm
xor eax, eax
```

Do not use `mov rax, 0` because it generates a 7-byte instruction requiring immediate operand decoding, whereas `xor eax, eax` is a 2-byte instruction recognized by microarchitectural register rename units as a zero-latency idiom.
