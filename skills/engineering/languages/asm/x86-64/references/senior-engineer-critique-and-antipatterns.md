# Senior Assembly Engineer Critique & Anti-Patterns (x86-64)

Pragmatic engineering critique, performance fallacies, and microarchitectural traps identified across production systems and high-frequency trading codebases.

## 1. Core Engineering Fallacies

### Fallacy 1: "Hand-Written Assembly is Automatically Faster than Compiler Output"

The Reality:
Compilers (GCC `-O3`, Clang `-O3`) possess exhaustive global knowledge of register lifetimes, instruction scheduling tables, vector lane packing, and loop transformations. A naive hand-written assembly loop frequently runs slower than compiler output because humans:
- Fail to unroll dependency chains across multiple accumulators.
- Introduce false register dependencies via partial-register writes (`mov al`).
- Ignore cache line splits and loop entry fetch alignment.
- Omit `.cfi` frame unwinding metadata, breaking profilers (such as Linux `perf`).

When hand-written assembly is actually justified:
- Exploiting instruction set extensions before compilers support them efficiently.
- Crafting custom calling conventions for JIT runtimes or coroutine context switches.
- Eliminating branches on hostile or non-stationary data distributions via branchless arithmetic.
- Microarchitectural kernel inner loops (GEMM, cryptographic ciphers, high-speed serialization).

### Fallacy 2: "Always Unroll Loops Aggressively"

The Reality:
Unrolling 8x or 16x was a winning strategy in the Pentium III and Core 2 era to amortize branch overhead. In modern CPUs equipped with Decoded Stream Buffers ($\mu$op caches) and Branch Target Buffers (BTB), aggressive unrolling causes:
- $\mu$op cache eviction: The loop body exceeds the DSB capacity, forcing the front-end to fall back to the slower legacy decoders (MITE), cutting throughput in half.
- L1 instruction cache pollution: Inflates instruction cache footprint and displaces caller code.
- Rule: Benchmark unrolling bounds. 2x to 4x unrolling with multiple accumulators is almost always the optimal trade-off point.

### Fallacy 3: "Use MOV Reg, 0 to Reset Registers"

The Reality:
`mov rax, 0` consumes 7 instruction bytes (or 5 bytes for `mov eax, 0`) and requires an execution port ALU dispatch. `xor eax, eax` consumes 2 bytes, is recognized by the register renamer as a dependency-breaking zero-idiom, and executes with zero latency without consuming an execution port ALU slot.

## 2. Microarchitectural Traps & Failure Modes

| Trap | Root Cause | Impact | Senior Solution |
| :--- | :--- | :--- | :--- |
| **Store-to-Load Forwarding (STLF) Stall** | Storing 32 bits, then loading 64 bits from the same location. | 10 to 22 cycle pipeline stall. | Always store using the full width that will be loaded, or assemble in registers before storing. |
| **Partial Register Stall** | Writing `mov al, [rsi]` then reading `rax`. | Hardware must merge partial register state or stall out-of-order execution. | Always use `movzx eax, byte ptr [rsi]` to break dependency and zero upper bits. |
| **AVX-SSE Transition Penalty** | Calling a legacy SSE function after modifying YMM/ZMM without `vzeroupper`. | Intel CPUs stall for tens to hundreds of cycles saving high YMM halves. | Always emit `vzeroupper` prior to exiting a function that touched 256/512-bit registers. |
| **Unfenced RDTSC Skew** | Issuing `rdtsc` without an instruction serialization barrier. | Out-of-order engine speculatively executes `rdtsc` early or late, distorting metrics. | Pair `cpuid` or `lfence` before and `rdtscp` + `cpuid` after timing blocks. |
| **Stack Alignment Crash** | Invoking a `call` when `RSP % 16 != 0`. | Signal `#GP` crash inside standard C runtime SIMD functions (`movaps`). | Verify stack frame allocation is always an odd multiple of 8 before `call`. |
| **False Memory Aliasing** | Two pointers that differ by multiples of 4KB (`offset % 4096 == 0`). | CPU 4K aliasing detection logic falsely assumes a collision, stalling loads. | Stagger buffer allocations or enforce cache-line offsets. |

## 3. The Senior Review Checklist for x86-64

Before accepting any hand-written x86-64 assembly into production:

1. [ ] **Zero-Idiom Purity**: Are all register clears using `xor r32, r32` or `vxorps`?
2. [ ] **Stack Alignment Verification**: Does `rsp % 16 == 0` hold immediately prior to every `call`?
3. [ ] **Callee Register Protection**: Are `rbx`, `rsp`, `rbp`, `r12`-`r15` untouched or properly saved and restored?
4. [ ] **vzeroupper Hygiene**: If 256-bit or 512-bit registers were modified, is `vzeroupper` issued before `ret` or foreign calls?
5. [ ] **Loop Alignment**: Are inner loop entry points aligned using `.p2align 5` or `.p2align 4,,15`?
6. [ ] **Multi-Accumulator Widening**: Are reduction loops unrolled across at least 2 to 4 independent accumulator registers to avoid serial latency stalls?
7. [ ] **Non-Executable Stack**: Does the file contain `.section .note.GNU-stack,"",@progbits`?
