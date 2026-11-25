.intel_syntax noprefix
.global fast_streaming_copy_nt
.type fast_streaming_copy_nt, @function
.text

.p2align 6
fast_streaming_copy_nt:
    test rdx, rdx
    jz .L_ret

    # Align destination rdi to a 32-byte boundary before vmovntdq to prevent #GP faults
    mov ecx, edi
    and ecx, 31
    jz .L_check_vec
    mov eax, 32
    sub eax, ecx
    cmp rdx, rax
    cmovb rax, rdx
    sub rdx, rax

.L_align_loop:
    mov cl, byte ptr [rsi]
    mov byte ptr [rdi], cl
    inc rsi
    inc rdi
    dec rax
    jnz .L_align_loop

.L_check_vec:
    mov rax, rdx
    shr rax, 7
    jz .L_tail_copy

.p2align 5
.L_streaming_loop:
    prefetchnta [rsi + 512]
    prefetchnta [rsi + 576]

    vmovdqu ymm0, ymmword ptr [rsi]
    vmovdqu ymm1, ymmword ptr [rsi + 32]
    vmovdqu ymm2, ymmword ptr [rsi + 64]
    vmovdqu ymm3, ymmword ptr [rsi + 96]

    vmovntdq ymmword ptr [rdi], ymm0
    vmovntdq ymmword ptr [rdi + 32], ymm1
    vmovntdq ymmword ptr [rdi + 64], ymm2
    vmovntdq ymmword ptr [rdi + 96], ymm3

    add rsi, 128
    add rdi, 128
    dec rax
    jnz .L_streaming_loop

    sfence

.L_tail_copy:
    and edx, 127
    jz .L_done

.L_byte_loop:
    mov al, byte ptr [rsi]
    mov byte ptr [rdi], al
    inc rsi
    inc rdi
    dec edx
    jnz .L_byte_loop

.L_done:
    vzeroupper
.L_ret:
    ret

.size fast_streaming_copy_nt, .-fast_streaming_copy_nt
.section .note.GNU-stack,"",@progbits
