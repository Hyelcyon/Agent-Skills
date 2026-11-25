.global neon_matrix_vector_fma4x
.type neon_matrix_vector_fma4x, %function
.text

neon_matrix_vector_fma4x:
    movi v0.4s, #0
    movi v1.4s, #0
    movi v2.4s, #0
    movi v3.4s, #0

    lsr x3, x2, #4
    cbz x3, .L_remainder

.p2align 4
.L_unrolled_loop:
    ldp q4, q5, [x0], #32
    ldp q6, q7, [x0], #32
    ldp q16, q17, [x1], #32
    ldp q18, q19, [x1], #32

    fmla v0.4s, v4.4s, v16.4s
    fmla v1.4s, v5.4s, v17.4s
    fmla v2.4s, v6.4s, v18.4s
    fmla v3.4s, v7.4s, v19.4s

    subs x3, x3, #1
    b.ne .L_unrolled_loop

    fadd v0.4s, v0.4s, v1.4s
    fadd v2.4s, v2.4s, v3.4s
    fadd v0.4s, v0.4s, v2.4s

    // Collapse all 4 vector lanes to s0 BEFORE scalar tail runs, because scalar writes zero upper bits [127:32]
    faddp v0.4s, v0.4s, v0.4s
    faddp v0.4s, v0.4s, v0.4s

.L_remainder:
    ands x2, x2, #15
    b.eq .L_done

.L_tail_loop:
    ldr s4, [x0], #4
    ldr s5, [x1], #4
    fmadd s0, s4, s5, s0
    subs x2, x2, #1
    b.ne .L_tail_loop

.L_done:
    ret

.size neon_matrix_vector_fma4x, .-neon_matrix_vector_fma4x
.section .note.GNU-stack,"",%progbits
