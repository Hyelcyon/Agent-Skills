# Lock-Free Concurrency & Memory Fences at Microarchitectural Scale

Architectural standard for lock-free multi-producer multi-consumer (MPMC) synchronization, cache line isolation, false sharing mitigation, and hardware memory barriers across x86-64 and ARM64.

## 1. Hardware Memory Ordering Models: TSO vs. Weak Ordering

Understanding the hardware guarantees of target processor architectures is mandatory before authoring lock-free concurrent primitives:

| Operation | x86-64 (Total Store Order - TSO) | ARM64 (Weakly Ordered Memory) |
| :--- | :--- | :--- |
| Load-Load Reordering | Never reordered by hardware | Allowed; requires `ldar` or `dmb ishld` |
| Store-Store Reordering | Never reordered by hardware | Allowed; requires `stlr` or `dmb ishst` |
| Load-Store Reordering | Never reordered by hardware | Allowed; requires `dmb ish` |
| Store-Load Reordering | Allowed; requires `mfence` or `lock` prefix | Allowed; requires `dmb ish` |

On x86-64, every standard load has implicit acquire semantics and every standard store has implicit release semantics. Only Store-Load reordering can occur (a load can bypass an earlier store to a different address). On ARM64, all memory accesses can be reordered unless explicitly tagged with acquire-release (`ldar`/`stlr`) or fenced.

## 2. False Sharing: The Invisible Performance Killer

In multicore architectures, memory coherence is maintained at the granularity of a **64-byte cache line**, not individual variables.

```
Core 0 writes: Thread_0_Counter (8 bytes)  ──┐
                                             ├──> [Same 64-Byte Cache Line]
Core 1 writes: Thread_1_Counter (8 bytes)  ──┘
```

When two threads on different cores update distinct variables that share the same 64-byte cache line:
1. Core 0 writing to `Thread_0_Counter` invalidates the entire 64-byte line in Core 1's L1 cache.
2. Core 1 must reload the line from L3/DRAM before writing to `Thread_1_Counter`, immediately invalidating Core 0's cache.
3. This creates **Cache Line Ping-Pong**, degrading throughput by up to 100x compared to isolated execution.

### The Invariant

Every concurrently modified variable, atomic head/tail pointer, or queue sequence counter MUST be padded and aligned to a 64-byte or 128-byte boundary:

```nasm
.p2align 6
thread_local_slot:
    .quad 0
    .space 56
```

## 3. High-Performance MPMC Slot Reservation (Ticket Queue)

To implement a wait-free or lock-free Multi-Producer Multi-Consumer (MPMC) queue without mutexes:
1. Maintain an atomically incrementing ticket counter representing the next available sequence slot.
2. Producers claim a slot using atomic fetch-and-add:
   - x86-64: `lock xadd [rdi], rax`
   - ARM64: `ldaddal x1, x2, [x0]`
3. The returned sequence ticket gives that specific producer exclusive ownership of the buffer index `ticket % CAPACITY`.
4. No other producer can claim the same slot, eliminating race conditions during data population.
5. The consumer tracks a completion sequence to read elements in FIFO order.

## 4. Hardware Serialization & Memory Fences

### When is a Full Fence Required?

A full hardware memory barrier (`mfence` on x86, `dmb ish` on ARM64) is strictly required ONLY when a store must become globally visible before a subsequent load from a different address (e.g. Peterson's mutual exclusion algorithm, hazard pointer publishing, or epoch-based reclamation).

### Zero-Cost Acquire-Release Synchronization

In 95% of lock-free queue designs, one-way acquire-release synchronization is sufficient:
- Publisher: Writes data buffer, then issues `stlr` (or plain `mov` on x86) on the atomic sequence flag.
- Consumer: Issues `ldar` (or plain `mov` on x86) on the sequence flag, then reads data buffer.
- This creates an ordering barrier without incurring the 30-cycle penalty of a full `mfence`.
