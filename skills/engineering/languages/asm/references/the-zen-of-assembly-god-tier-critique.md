# The Zen of Assembly: Senior God-Tier Engineering Principles

The definitive philosophy, empirical mental models, and uncompromising critique for architecting cycle-perfect, microarchitecture-saturating assembly software.

---

## 1. The Core Commandments of Assembly Engineering

### Commandment 1: "The Best Instruction is the One Never Executed"
Do not spend hours micro-optimizing an inner loop if an algorithmic transformation can eliminate the loop entirely. A branchless bitwise trick or SIMD range mask that processes 32 bytes in 2 cycles beats an unrolled scalar loop containing 64 perfectly scheduled instructions.

### Commandment 2: "Latency is the Enemy of Chains; Throughput is the Child of Accumulators"
Instruction latency only hurts when instructions form a serial dependency chain. The moment you break an algorithm into 4 or 8 independent accumulator streams, execution latency dissolves into the out-of-order execution window, achieving 100% execution port throughput.

### Commandment 3: "A DRAM Cache Miss Costs 200 Instructions"
Optimizing register allocation while ignoring cache lines is amateur engineering. A single L3 cache miss costs 40 to 60 cycles; a DRAM access costs 200 cycles. If your memory access patterns cause cache-line splits or trigger Read-For-Ownership penalties, instruction-level micro-optimizations are irrelevant.

### Commandment 4: "Mispredicted Branches Destroy Superscalar Pipelines"
On modern 16-to-20 stage pipelines, a single branch misprediction flushes all speculative execution in flight, wasting up to 100 $\mu$ops of potential throughput. Convert data-dependent branches on non-stationary distributions into branchless conditional moves (`cmov` / `csel`), arithmetic masks, or vector blends.

### Commandment 5: "The Compiler is Your Baseline, Not Your Inferior"
Before authoring a single line of hand-crafted assembly, compile an idiomatic C/Rust implementation with `-O3 -fomit-frame-pointer -march=native` and inspect the generated disassembly. You must understand exactly where and why the compiler failed (e.g. failing to prove pointer aliasing, missing vector lane shuffles, or inserting redundant spills) before you can justify writing hand assembly.

---

## 2. The Ten Deadly Sins of Assembly Programming

| Sin | Description | Physical Microarchitectural Consequence | Correct Senior Architecture |
| :--- | :--- | :--- | :--- |
| **1. Scalar Accumulation** | Reusing a single register in a reduction loop. | Throttles speed to instruction latency (3-5 cycles per iteration). | Unroll with 4 to 8 independent vector accumulators. |
| **2. Unnecessary Unrolling** | Unrolling loops 16x or 32x. | Evicts loop from the Decoded Stream Buffer ($\mu$op cache), dropping front-end decode by 50%. | Size inner loops under 96 $\mu$ops (typically 2x to 4x unrolling). |
| **3. False Sharing** | Putting independent atomic counters in the same 64-byte line. | Cache line ping-pong across cores, degrading throughput up to 100x. | Pad atomic variables to 64 or 128 bytes with `.p2align 6`. |
| **4. Redundant Memory Writes** | Modifying partial memory fields without streaming. | Incurs Read-For-Ownership (RFO) tax, doubling bus traffic. | Assemble full cache lines in registers and use non-temporal stores (`vmovntdq`). |
| **5. Partial Register Stalls** | Writing `mov al, [rsi]` then reading `rax`. | Hardware stalls out-of-order execution to merge partial register state. | Always use zero-extending moves (`movzx eax, byte ptr [...]`). |
| **6. Stack Misalignment** | Invoking `call` when `RSP % 16 != 0`. | General Protection Fault (`#GP`) crash on standard C runtime SIMD functions. | Enforce 16-byte stack frame invariants prior to all external calls. |
| **7. Missing vzeroupper** | Touching 256/512-bit registers and calling legacy code without cleaning up. | AVX-SSE transition penalty stalling CPU pipeline for dozens of cycles. | Always emit `vzeroupper` before returning from or calling out of AVX functions. |
| **8. Port Contention** | Clumping instructions that target the same execution port. | Serializes execution even with independent registers. | Interleave arithmetic (Port 0/1) with shuffles (Port 5) and loads (Port 2/3). |
| **9. Blind Software Prefetch** | Placing `prefetcht0` / `prfm` randomly in sequential loops. | Pollutes cache and interferes with hardware stride prefetchers. | Calculate distance $D = \lceil \text{Latency}/\text{Cycles} \rceil \times \text{Stride}$ or omit for strided data. |
| **10. Missing CFI Directives** | Writing assembly without `.cfi_startproc` / `.cfi_def_cfa_offset`. | Breaks DWARF stack unwinding, rendering Linux `perf` and profilers blind. | Include full CFI metadata on all exported functions. |
