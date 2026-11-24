.intel_syntax noprefix
.global avx2_dot_product_4x
.text

.p2align 5
avx2_dot_product_4x:
    vxorps ymm0, ymm0, ymm0
    vxorps ymm1, ymm1, ymm1
    vxorps ymm2, ymm2, ymm2
    vxorps ymm3, ymm3, ymm3

    mov rax, rdx
    shr rax, 5
    jz .L_scalar_remainder

.p2align 5
.L_unrolled_loop:
    vmovups ymm4, ymmword ptr [rdi]
    vmovups ymm5, ymmword ptr [rdi + 32]
    vmovups ymm6, ymmword ptr [rdi + 64]
    vmovups ymm7, ymmword ptr [rdi + 96]

    vfmadd231ps ymm0, ymm4, ymmword ptr [rsi]
    vfmadd231ps ymm1, ymm5, ymmword ptr [rsi + 32]
    vfmadd231ps ymm2, ymm6, ymmword ptr [rsi + 64]
    vfmadd231ps ymm3, ymm7, ymmword ptr [rsi + 96]

    add rdi, 128
    add rsi, 128
    dec rax
    jnz .L_unrolled_loop

    vaddps ymm0, ymm0, ymm1
    vaddps ymm2, ymm2, ymm3
    vaddps ymm0, ymm0, ymm2

.L_scalar_remainder:
    and edx, 31
    jz .L_reduce_to_scalar

.L_tail_loop:
    vmovss xmm4, dword ptr [rdi]
    vfmadd231ss xmm0, xmm4, dword ptr [rsi]
    add rdi, 4
    add rsi, 4
    dec edx
    jnz .L_tail_loop

.L_reduce_to_scalar:
    vextractf128 xmm1, ymm0, 1
    vaddps xmm0, xmm0, xmm1
    vshufps xmm1, xmm0, xmm0, 0x4E
    vaddps xmm0, xmm0, xmm1
    vshufps xmm1, xmm0, xmm0, 0xB1
    vaddss xmm0, xmm0, xmm1

    vzeroupper
    ret

.section .note.GNU-stack,"",@progbits
