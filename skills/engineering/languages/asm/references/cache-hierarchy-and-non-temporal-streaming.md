# Cache Hierarchy & Non-Temporal Streaming Architectures

Engineering guide for mastering CPU cache hierarchies (L1, L2, L3, SLC), Write-Combining (WC) buffers, Read-For-Ownership (RFO) avoidance, and software prefetch mathematics.

## 1. The Memory Wall & Cache Latency Hierarchy

Execution speed in modern high-performance computing is governed by memory access latency:

| Level | Size (Typical) | Latency (Cycles) | Bandwidth (Bytes/Cycle) |
| :--- | :--- | :--- | :--- |
| L1 Data Cache | 32 KB - 64 KB per core | 4 - 5 cycles | Up to 128 bytes/cycle |
| L2 Cache | 1 MB - 2 MB per core | 12 - 14 cycles | Up to 64 bytes/cycle |
| L3 Cache | 16 MB - 96 MB shared | 40 - 60 cycles | Up to 32 bytes/cycle |
| Main DRAM | 16 GB - 512 GB | 180 - 250 cycles | 0.5 - 2 bytes/cycle |

A single cache miss accessing DRAM stalls a superscalar CPU for hundreds of clock cycles, idling dozens of execution units.

## 2. The Read-For-Ownership (RFO) Tax on Standard Writes

When a CPU issues a standard store instruction (`vmovaps [rdi], ymm0`), it does not simply write data to memory. Under the MESI/MOESI cache coherence protocols:
1. The CPU checks if the target 64-byte cache line is already present in L1/L2 in Modified (M) or Exclusive (E) state.
2. If absent (a write miss), the CPU must issue a **Read For Ownership (RFO)** request over the memory bus to read the entire 64-byte line from DRAM into the cache before overwriting it.
3. This cuts effective write bandwidth in half: writing 1 GB of data actually transfers 1 GB of read traffic + 1 GB of write traffic (2 GB total bus saturation).

## 3. Non-Temporal Streaming Stores (Bypassing RFO)

When writing large data volumes that exceed L3 cache capacity (e.g. video frames, network packet buffers, column scans), bypass the cache hierarchy completely using Non-Temporal Stores:
- x86-64: `vmovntdq`, `vmovntps`, `movnti`
- ARM64: `stnp` (Store Non-temporal Pair)

### The Write-Combining (WC) Buffer Mechanism

```
[CPU Core Registers]
        │
        ▼ (Non-temporal store)
[Write-Combining Buffers (WC)] <── Merges writes into full 64-byte cache lines
        │
        ▼ (Burst write directly to memory bus without RFO read)
[Main System Memory (DRAM)]
```

- Non-temporal stores stream directly into internal 64-byte Write-Combining buffers.
- Once a full 64-byte cache line is assembled, the WC buffer flushes it directly to the memory controller in a single burst write, completely bypassing L1, L2, and L3 caches.
- Eliminates RFO traffic, saving 50% of memory bus bandwidth.
- Prohibits cache pollution: Caller code and hot working sets in L1/L2/L3 remain undisturbed.

### Termination Invariant

Because non-temporal stores operate on weakly ordered memory buffers, you MUST issue a Store Fence (`sfence` on x86, `dmb ish` on ARM64) after the streaming loop to ensure all buffered WC lines are committed before downstream tasks read the memory:

```nasm
vmovntdq ymmword ptr [rdi], ymm0
vmovntdq ymmword ptr [rdi + 32], ymm1
sfence
```

## 4. Software Prefetching Mathematics

Do not guess prefetch offsets. Calculate the exact prefetch distance ($D$) based on memory latency and loop cycle count:

$$D = \left\lceil \frac{\text{Memory Latency (Cycles)}}{\text{Loop Execution Time (Cycles)}} \right\rceil \times \text{Stride (Bytes)}$$

### Concrete Calculation Example

- Target DRAM Latency: 200 cycles.
- Unrolled Loop Iteration Time: 20 cycles (processing 128 bytes per iteration).
- Distance in Iterations: $200 / 20 = 10 \text{ iterations ahead}$.
- Stride in Bytes: $10 \times 128 = 1280 \text{ bytes ahead}$.

In assembly:

```nasm
prefetcht0 [rsi + 1280]
```

Prefetching too close ($< 200$ bytes) arrives too late to hide latency; prefetching too far ($> 4096$ bytes) evicts useful cache lines before the loop can read the data.
