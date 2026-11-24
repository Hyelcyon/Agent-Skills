.intel_syntax noprefix
.global fast_u32_to_ascii_swar
.type fast_u32_to_ascii_swar, @function
.text

.p2align 4
fast_u32_to_ascii_swar:
    mov eax, edi
    mov ecx, 10
    lea r8, [rsi + 10]
    mov byte ptr [r8], 0
    mov r9, r8

.L_convert_loop:
    xor edx, edx
    div ecx
    add dl, '0'
    dec r9
    mov byte ptr [r9], dl
    test eax, eax
    jnz .L_convert_loop

    mov rax, r9
    ret

.size fast_u32_to_ascii_swar, .-fast_u32_to_ascii_swar
.section .note.GNU-stack,"",@progbits
