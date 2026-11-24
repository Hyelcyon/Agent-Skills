# SIMD Vector Supercomputing & SWAR (SIMD Within A Register)

Architectural guide to vector parallelism, branchless table-lookup parsing (`vpshufb` / `tbl`), AVX-512 opmask computing, and scalar 64-bit SWAR bit-twiddling algorithms.

## 1. Vector In-Register Lookup Tables (`vpshufb` & `tbl`)

The byte shuffle instructions (`vpshufb` on x86, `tbl` on ARM64) function as parallel 16-entry or 32-entry lookup tables executing in a single clock cycle.

### Parallel Nibble Decoding (e.g. Hexadecimal / Base64 / ASCII)

Instead of scalar switch statements or array lookups in memory:
1. Extract the high 4 bits (nibble) of 32 bytes simultaneously into vector register `A`.
2. Extract the low 4 bits into vector register `B`.
3. Use the extracted nibbles as direct 4-bit indices ($0 \dots 15$) into constant lookup tables stored in vector registers `LUT_HIGH` and `LUT_LOW`.
4. Combine results via bitwise AND / OR.

This technique processes 32 or 64 bytes per clock cycle without a single memory read or conditional branch.

## 2. Fast SIMD Character Classification & Range Filtering

Classifying characters (e.g. validating whitespace, delimiters, or UTF-8 lead bytes) can be executed in 2 instructions across 32 bytes:

```nasm
vmovdqa ymm0, ymmword ptr [rsi]
vpcmpeqb ymm1, ymm0, ymmword ptr [rip + whitespace_mask]
vpmovmskb eax, ymm1
```

- `vpcmpeqb` produces an all-ones byte (`0xFF`) for every match and `0x00` otherwise.
- `vpmovmskb` extracts the most significant bit of each vector byte into a standard 32-bit integer register `eax`.
- Trailing Zero Count (`tzcnt eax, eax`) or Bit Scan Forward (`bsf`) directly yields the exact byte index of the matching delimiter in 1 cycle.

## 3. AVX-512 Opmask Architecture & Zero-Cost Branch Elimination

AVX-512 introduces dedicated opmask registers (`k0` through `k7`) that decouple predicate computation from data registers:

```nasm
vcmpps k1, zmm0, zmm1, 1
vmovaps zmm2 {k1}{z}, zmm3
```

- Condition comparison writes an 8/16/32/64-bit bitmask directly into `k1`.
- `{k1}` conditionally executes the move.
- `{z}` zeroes masked-out lanes without reading prior destination values, breaking false register dependencies.
- Eliminates vector blend instructions (`vblendvps`) and removes conditional branch instructions entirely.

## 4. SWAR: SIMD Within A Register (64-bit Scalar Vectorization)

When SIMD registers cannot be used (e.g. ABI constraints or small data chunks), operate on eight 8-bit bytes simultaneously inside a standard 64-bit general-purpose integer register (`uint64_t`).

### Finding Zero Bytes in 64-bit Words (Alan Mycroft's Algorithm)

To detect whether an 8-byte word contains a null terminator (`0x00`) in $O(1)$ arithmetic:

```c
uint64_t has_zero_byte(uint64_t v) {
    return (v - 0x0101010101010101ULL) & ~v & 0x8080808080808080ULL;
}
```

In assembly:

```nasm
mov rdx, 0x0101010101010101
mov r8,  0x8080808080808080
mov rcx, rdi
sub rcx, rdx
not rdi
and rcx, rdi
and rcx, r8
```

If `rcx != 0`, at least one byte in the 64-bit register is null. The index of the first zero byte is computed directly:

```nasm
tzcnt rcx, rcx
shr rcx, 3
```

This processes 8 bytes per iteration using only 5 integer ALU instructions without SIMD pipeline state switches.
