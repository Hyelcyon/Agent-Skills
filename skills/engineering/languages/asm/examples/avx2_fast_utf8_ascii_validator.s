.intel_syntax noprefix
.global avx2_is_ascii_valid
.type avx2_is_ascii_valid, @function
.text

.p2align 5
avx2_is_ascii_valid:
    vpxor ymm0, ymm0, ymm0
    mov rax, rsi
    shr rax, 5
    jz .L_scalar_tail

.p2align 5
.L_vector_loop:
    vmovdqu ymm1, ymmword ptr [rdi]
    vpor ymm0, ymm0, ymm1
    add rdi, 32
    dec rax
    jnz .L_vector_loop

    vpmovmskb edx, ymm0
    test edx, edx
    jnz .L_invalid

.L_scalar_tail:
    and esi, 31
    jz .L_valid

.L_scalar_loop:
    cmp byte ptr [rdi], 0
    js .L_invalid
    inc rdi
    dec esi
    jnz .L_scalar_loop

.L_valid:
    mov eax, 1
    vzeroupper
    ret

.L_invalid:
    xor eax, eax
    vzeroupper
    ret

.size avx2_is_ascii_valid, .-avx2_is_ascii_valid
.section .note.GNU-stack,"",@progbits
