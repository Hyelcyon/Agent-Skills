.global dot_product_f32
.type dot_product_f32, %function

dot_product_f32:
    movi v0.4s, #0
    cbz x2, .L_exit

    lsr x3, x2, #2
    cbz x3, .L_scalar_tail

.L_vector_loop:
    ld1 {v1.4s}, [x0], #16
    ld1 {v2.4s}, [x1], #16
    fmla v0.4s, v1.4s, v2.4s
    subs x3, x3, #1
    b.ne .L_vector_loop

    faddp v0.4s, v0.4s, v0.4s
    faddp v0.4s, v0.4s, v0.4s

.L_scalar_tail:
    ands x2, x2, #3
    b.eq .L_exit

.L_scalar_loop:
    ldr s1, [x0], #4
    ldr s2, [x1], #4
    fmadd s0, s1, s2, s0
    subs x2, x2, #1
    b.ne .L_scalar_loop

.L_exit:
    ret

.size dot_product_f32, .-dot_product_f32
.section .note.GNU-stack,"",%progbits
