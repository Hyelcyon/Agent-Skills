# Senior Assembly Engineer Critique & Anti-Patterns (ARM64)

Pragmatic engineering critique, performance fallacies, and microarchitectural traps identified across high-performance AArch64 and Apple Silicon systems.

## 1. Core Engineering Fallacies

### Fallacy 1: "Small Loops are Fast Loops"

The Reality:
On modern wide-issue ARM64 engines (Apple Firestorm 8-wide, Neoverse V2 8-wide), small loops starve execution ports. If an inner loop contains only 3 or 4 instructions, the entire loop decodes in half a cycle, forcing the branch predictor and decoder to wait for the next iteration.
- Senior Reality: Unroll loops 4x or 8x to provide 16 to 32 instructions per iteration. This saturates the decode window and gives the out-of-order scheduler enough independent operations to reorder effectively.

### Fallacy 2: "Always Insert Software Prefetch (PRFM) Instructions"

The Reality:
Apple Silicon and ARM Neoverse cores feature aggressive hardware stride and stream prefetchers. Indiscriminate use of `prfm` instructions:
- Consumes valuable decode and execution bandwidth.
- Displaces cache lines that the hardware prefetcher would have handled more accurately.
- Senior Rule: Benchmark with and without `prfm`. Reserve software prefetching strictly for irregular, non-strided access patterns (such as graph traversal or hash table bucket chasing).

### Fallacy 3: "Use LDXR/STXR Everywhere for Atomics"

The Reality:
In multi-socket or 64+ core server environments (e.g. AWS Graviton), `ldxr`/`stxr` loops suffer from catastrophic livelock and starvation under high contention. A single core writing to adjacent memory invalidates all monitors across all cores, forcing every worker thread to restart the loop.
- Senior Reality: Use ARMv8.1-A Large System Extensions (`ldaddal`, `casal`) whenever hardware support is present. LSE executes at the memory controller level without loop retries.

## 2. Microarchitectural Traps & Failure Modes

| Trap | Root Cause | Impact | Senior Solution |
| :--- | :--- | :--- | :--- |
| **SP Hardware Alignment Exception** | Using `sp` as a base register when `sp % 16 != 0`. | Immediate hardware Alignment Fault crash. | Maintain 16-byte stack allocation invariants across all subroutines. |
| **Single-Accumulator Serial RAW Stall** | Accumulating results into a single NEON register in a tight loop. | Execution throttled to instruction latency (3-4 cycles/iter). | Widen reduction loops to use 4 independent vector accumulators (`v0`-`v3`). |
| **Clobbering D8-D15** | Using `v8`-`v15` without preserving their lower 64 bits (`d8`-`d15`). | Silent data corruption in caller floating-point routines. | Push non-volatile FP registers using `stp d8, d9, [sp, -16]!`. |
| **Missing Acquire-Release Semantics** | Reading shared state with plain `ldr` without `ldar` or `dmb ish`. | Out-of-order engine speculatively reorders reads, causing race conditions. | Pair publishing `stlr` with consuming `ldar` to enforce synchronization. |
| **Branch Penalty in Search Loops** | Using `cmp` + `b.eq` inside tight search algorithms. | Pipeline flush on random data distributions (12-16 cycles). | Use conditional select `csel` or NEON vector masking to achieve branchless flow. |
| **Omitting PAC Signing** | Creating non-leaf frames on Apple Silicon / hardened Linux without PAC. | Security vulnerability and rejection by hardened runtime loaders. | Enclose subroutines with `paciasp` in prologue and `autiasp` before `ret`. |

## 3. The Senior Review Checklist for ARM64

Before approving ARM64 assembly modules:

1. [ ] **Stack Alignment**: Is `sp` strictly 16-byte aligned on entry, exit, and every intermediate stack adjustment?
2. [ ] **Frame Record Linkage**: Are `x29` and `x30` chained with `stp x29, x30, [sp, -16]!` in all non-leaf functions?
3. [ ] **Non-Volatile Preservation**: Are `x19`-`x28` and `d8`-`d15` preserved across subroutine calls?
4. [ ] **LDP / STP Dominance**: Are loads and stores grouped as 128-bit `q` or 64-bit `x` register pairs rather than scalar singletons?
5. [ ] **Multi-Accumulator Depth**: Do computational loops maintain at least 4 independent accumulator streams?
6. [ ] **Memory Model Correctness**: Are lock-free and thread-communication boundaries protected by `ldar`/`stlr` or `dmb ish`?
7. [ ] **Non-Executable Stack**: Does the file contain `.section .note.GNU-stack,"",%progbits`?
