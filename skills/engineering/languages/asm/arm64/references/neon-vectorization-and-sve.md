# ARM64 NEON Vectorization & SVE Architectural Deep Dive

Architectural guide for utilizing ARM Advanced SIMD (NEON) and Scalable Vector Extension (SVE/SVE2) instruction sets on ARMv8-A and ARMv9-A processors.

## 1. NEON Register Structure & Data Arrangements

ARM64 provides thirty-two 128-bit vector registers (`v0` through `v31`). Each vector register can be partitioned into elements of various scalar sizes:

| Specifier | Description | Element Count and Size |
| :--- | :--- | :--- |
| `.16b` | 16 Bytes | 16 $\times$ 8-bit integers |
| `.8h` | 8 Halfwords | 8 $\times$ 16-bit integers / fp16 |
| `.4s` | 4 Words | 4 $\times$ 32-bit integers / single-precision floats |
| `.2d` | 2 Doublewords | 2 $\times$ 64-bit integers / double-precision floats |
| `.8b` | 8 Bytes (64-bit lower half) | 8 $\times$ 8-bit integers |
| `.4h` | 4 Halfwords (64-bit lower half) | 4 $\times$ 16-bit integers |
| `.2s` | 2 Words (64-bit lower half) | 2 $\times$ 32-bit integers |

## 2. Core SIMD Arithmetic Instructions

### Vector Addition and Multiplication

```asm
fadd v0.4s, v1.4s, v2.4s
fmul v0.4s, v1.4s, v2.4s
```

### Fused Multiply-Accumulate (FMLA)

Performs $V_d = V_d + (V_n \times V_m)$ with a single rounding step:

```asm
fmla v0.4s, v1.4s, v2.4s
```

FMLA eliminates intermediate floating-point precision loss and executes with higher throughput than distinct multiply and add operations.

### Pairwise Operations & Horizontal Reduction

Pairwise instructions collapse adjacent lanes across vectors:

```asm
faddp v0.4s, v1.4s, v2.4s
```

This adds `v1.s[0] + v1.s[1]`, `v1.s[2] + v1.s[3]`, `v2.s[0] + v2.s[1]`, and `v2.s[2] + v2.s[3]`, producing a compressed 4-lane result.

## 3. Structure Loads & Interleaved Data Streams

NEON provides hardware de-interleaving and interleaving instructions for audio (stereo channels) and image processing (RGBA channels):

```asm
ld2 {v0.4s, v1.4s}, [x0], #32
st2 {v0.4s, v1.4s}, [x1], #32
```

`ld2` loads 32 bytes from memory and automatically separates interleaved alternating channels into register `v0` and register `v1`.

## 4. Scalable Vector Extension (SVE / SVE2)

ARMv9 introduces SVE2, which replaces fixed 128-bit vector assumptions with hardware-agnostic scalable vector lengths (ranging from 128 bits to 2048 bits in 128-bit increments):

- Predicate Registers (`p0`-`p15`): Control lane masking without explicit branch branching.
- `whilelt`: Automatically configures active lanes based on scalar loop counter bounds.
- Eliminates manual loop remainder scalar peeling.
