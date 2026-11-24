# Inline Assembly & Compiler Intrinsics in Modern Toolchains

Authoring guidelines for embedding assembly routines within C, C++, and Rust codebases while preserving compiler optimization invariants and memory orderings.

## 1. GNU Extended Inline Assembly Syntax

GCC and Clang implement extended inline assembly using four colon-separated components:

```c
__asm__ volatile (
    AssemblerTemplate
    : OutputOperands
    : InputOperands
    : ClobberedRegisters
);
```

### Volatile Keyword

The `volatile` qualifier prohibits the compiler from optimizing out, reordering, or lifting the assembly block out of loops, even if the block specifies no output variables.

## 2. Operand Constraints & Modifiers

### Common Constraint Characters

- `r`: Allocate any available 64-bit general-purpose register.
- `m`: Memory operand (direct memory reference without register staging).
- `i`: Immediate integer constant known at compile-time.
- `a`: Specifically allocate `rax`/`eax`.
- `d`: Specifically allocate `rdx`/`edx`.
- `c`: Specifically allocate `rcx`/`ecx`.
- `x`: Allocate any SSE/AVX vector register (`xmm`).

### Modifiers

- `=`: Write-only output operand (overwrites previous value).
- `+`: Read-modify-write operand (both input and output).
- `&`: Early-clobber operand. Indicates that the register is modified before the instruction finishes reading inputs, preventing the compiler from assigning the same register to an input and this output.

## 3. Clobber Lists & The "memory" Barrier

When inline assembly modifies registers not listed in output operands, those registers must appear in the clobber list.

### Crucial Clobbers

- `"memory"`: Informs the compiler optimizer that the assembly block reads or writes arbitrary memory locations. The compiler must flush pending register-cached variables to memory prior to the block and reload them after.
- `"cc"`: Indicates that the arithmetic condition flags (`rflags`) are modified.

## 4. Hardware Serialization & Timestamping

Reading the Time Stamp Counter (`rdtsc`) in out-of-order execution engines requires instruction serialization via `cpuid` or `lfence` to prevent speculative execution from skewing cycle counts:

```c
static inline unsigned long long rdtsc_fenced(void) {
    unsigned int lo;
    unsigned int hi;
    __asm__ volatile (
        "lfence\n\t"
        "rdtsc\n\t"
        : "=a"(lo), "=d"(hi)
        :
        : "memory"
    );
    return ((unsigned long long)hi << 32) | lo;
}
```

## 5. C/C++ Intrinsics vs. Inline Assembly

Where possible in user-space logic, prefer compiler intrinsics (`<immintrin.h>`) over inline assembly:
- Intrinsics integrate with the compiler's register allocator and instruction scheduler.
- Inline assembly acts as an opaque black box to the compiler optimizer, disabling cross-instruction vectorization.
- Reserve raw inline assembly for CPU system registers (`cr0`, `cr3`), architectural barriers (`mfence`, `lfence`), and explicit context switching routines.
