.intel_syntax noprefix
.global fast_strlen
.text

fast_strlen:
    mov rax, rdi
    mov rcx, rdi
    and rcx, 31
    jz .L_aligned_loop

    neg rcx
    add rcx, 32

.L_head_scalar:
    cmp byte ptr [rax], 0
    je .L_done
    inc rax
    dec rcx
    jnz .L_head_scalar

.L_aligned_loop:
    vpxor ymm0, ymm0, ymm0

.L_vector_scan:
    vpcmpeqb ymm1, ymm0, ymmword ptr [rax]
    vpmovmskb edx, ymm1
    test edx, edx
    jnz .L_found_zero
    add rax, 32
    jmp .L_vector_scan

.L_found_zero:
    tzcnt edx, edx
    add rax, rdx

.L_done:
    sub rax, rdi
    vzeroupper
    ret

.section .note.GNU-stack,"",@progbits
