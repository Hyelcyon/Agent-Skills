# ARM64 Weakly Ordered Memory Model & Synchronization Barriers

Comprehensive guide to memory ordering, acquire-release semantics, exclusive monitors, and hardware barrier instructions on ARMv8/v9 processors.

## 1. Weakly Ordered Memory vs x86 TSO

Unlike the x86-64 Total Store Order (TSO) architecture, which guarantees that stores to distinct memory locations become globally visible in strict program order, ARM64 implements a Weakly Ordered Memory Model:
- Loads and stores to different addresses can be speculatively reordered by the hardware out-of-order execution engine.
- Memory writes from one core are not guaranteed to be visible to another core in program order unless explicit synchronization instructions or acquire-release operations are emitted.

## 2. One-Way Barriers: Load-Acquire & Store-Release

ARMv8 provides hardware one-way memory barrier semantics built directly into load and store instructions, avoiding the performance overhead of full pipeline flushes:

### Store-Release (`stlr`)

Guarantees that all preceding memory accesses (reads and writes) in program order become visible before the store itself is visible to external observers:

```asm
str  x1, [x2]
stlr x0, [x3]
```

### Load-Acquire (`ldar`)

Guarantees that the load completes before any subsequent memory accesses in program order are initiated:

```asm
ldar x0, [x3]
ldr  x1, [x2]
```

Combining `stlr` (on the publisher thread) and `ldar` (on the consumer thread) creates a synchronized-with relationship equivalent to C++11 `std::memory_order_release` and `std::memory_order_acquire`.

## 3. Explicit Hardware Memory Barriers

When synchronization between memory operations cannot be tied directly to a single load or store address, use the Data Memory Barrier (`dmb`) instruction with explicit domain and type specifiers:

| Instruction | Domain | Scope & Ordering Constraint |
| :--- | :--- | :--- |
| `dmb ish` | Inner Shareable | Orders all reads and writes across all CPU cores sharing memory. |
| `dmb ishst` | Inner Shareable Store | Orders only writes; reads can float past this barrier. |
| `dmb ishld` | Inner Shareable Load | Orders only reads; writes can float past this barrier. |
| `dmb sy` | System-wide | Orders memory accesses across CPU, GPU, DMA, and external peripherals. |
| `isb` | Pipeline Barrier | Flushes the processor pipeline, forcing refetch of instructions. |

## 4. Exclusive Monitors (LDXR / STXR)

ARM64 implements atomic Read-Modify-Write primitives using load-linked/store-conditional style hardware exclusive monitors:

```asm
.L_retry:
    ldaxr w1, [x0]
    add   w1, w1, 1
    stlxr w2, w1, [x0]
    cbnz  w2, .L_retry
```

- `ldaxr`: Load-Acquire Exclusive. Marks the target cache line as exclusively reserved by the current core in the local monitor.
- `stlxr`: Store-Release Exclusive. Stores the modified value only if the cache line remained undisturbed. Writes status code `0` on success, or `1` on collision.
- `cbnz`: Compares status register `w2` and retries the loop if a concurrent core modified the cache line.
