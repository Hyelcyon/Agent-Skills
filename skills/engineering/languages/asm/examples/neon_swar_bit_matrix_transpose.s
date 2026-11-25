.global neon_transpose_4x4_f32
.type neon_transpose_4x4_f32, %function
.text

// Transposes a packed 4x4 matrix of 32-bit floats in place from [x0] to [x1].
neon_transpose_4x4_f32:
    ld1 {v0.4s, v1.4s}, [x0]
    add x2, x0, #32
    ld1 {v2.4s, v3.4s}, [x2]

    trn1 v4.4s, v0.4s, v1.4s
    trn2 v5.4s, v0.4s, v1.4s
    trn1 v6.4s, v2.4s, v3.4s
    trn2 v7.4s, v2.4s, v3.4s

    trn1 v0.2d, v4.2d, v6.2d
    trn2 v2.2d, v4.2d, v6.2d
    trn1 v1.2d, v5.2d, v7.2d
    trn2 v3.2d, v5.2d, v7.2d

    st1 {v0.4s, v1.4s}, [x1]
    add x3, x1, #32
    st1 {v2.4s, v3.4s}, [x3]
    ret

.size neon_transpose_4x4_f32, .-neon_transpose_4x4_f32
.section .note.GNU-stack,"",%progbits
