# x86-64 SIMD Vectorization & AVX Optimization

Deep architectural guidance for leveraging SSE, AVX2, and AVX-512 vector pipelines while avoiding execution stalls, alignment penalties, and instruction encoding regressions.

## 1. Register Hierarchy & Encoding

Modern x86-64 processors support three generations of SIMD vector register widths:
- SSE: 128-bit `xmm0` through `xmm15`
- AVX/AVX2: 256-bit `ymm0` through `ymm15`
- AVX-512: 512-bit `zmm0` through `zmm31` (with `k0`-`k7` opmask registers)

### VEX and EVEX Prefix Advantages

Legacy SSE instructions used two-operand destructive encoding:
```nasm
addps xmm0, xmm1
```

AVX introduced VEX prefix encoding enabling three-operand non-destructive syntax:
```nasm
vaddps ymm0, ymm1, ymm2
```

EVEX prefix (AVX-512) expands this to 32 vector registers, embedded broadcast (`{1to8}`), dynamic rounding control, and conditional execution using mask registers (`k1`).

## 2. The AVX-SSE Transition Penalty & vzeroupper

Mixing legacy non-VEX SSE instructions with VEX-encoded 256-bit or 512-bit instructions causes CPU pipeline stalls on Intel architectures because the upper half of YMM registers must be saved or restored by internal microcode.

### The Invariant

Whenever a function modifies YMM or ZMM registers, issue `vzeroupper` prior to executing any foreign function call or issuing `ret`:

```nasm
vzeroupper
ret
```

Omitting `vzeroupper` can degrade downstream application execution speed by several hundred clock cycles per call boundary.

## 3. Aligned vs. Unaligned Memory Operations

- Aligned Moves (`vmovaps`, `vmovapd`, `vmovdqa`): Require 32-byte (YMM) or 64-byte (ZMM) address alignment. Violating alignment triggers a General Protection Fault (`#GP`).
- Unaligned Moves (`vmovups`, `vmovupd`, `vmovdqu`): Accept arbitrary memory boundaries. On modern microarchitectures (Intel Haswell+, AMD Zen+), unaligned moves incur zero latency overhead if the operand does not cross a 64-byte cache line boundary.

### Invariant for Code Generation

Use `vmovups` / `vmovupd` for general memory buffers unless the pointer is statically proven to be 32-byte or 64-byte aligned.

## 4. Register Zeroing Idioms

To zero a 256-bit vector register without incurring memory reads or false dependencies:

```nasm
vxorps xmm0, xmm0, xmm0
```

Zeroing the 128-bit `xmm0` register with `vxorps` automatically zeroes the upper 128 bits of `ymm0` while using fewer opcode bytes than explicitly addressing `ymm0`.

## 5. Non-Temporal Memory Streaming

When writing large datasets that exceed L3 cache capacity, bypass the cache hierarchy using non-temporal streaming stores to avoid cache pollution:

```nasm
vmovntps [rdi], ymm0
sfence
```

Always terminate a series of non-temporal stores with `sfence` to guarantee memory visibility across processor cores.
