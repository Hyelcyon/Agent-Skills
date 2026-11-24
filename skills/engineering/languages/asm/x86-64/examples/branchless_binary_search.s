.intel_syntax noprefix
.global branchless_lower_bound
.text

.p2align 4
branchless_lower_bound:
    xor eax, eax
    test rsi, rsi
    jz .L_empty

.L_search_loop:
    cmp rsi, 1
    jle .L_final_check

    mov rcx, rsi
    shr rcx, 1
    lea r8, [rax + rcx]

    cmp edx, dword ptr [rdi + r8*4]
    lea r9, [rax + rcx]
    cmovg rax, r9
    sub rsi, rcx
    jmp .L_search_loop

.L_final_check:
    cmp edx, dword ptr [rdi + rax*4]
    lea rdx, [rax + 1]
    cmovg rax, rdx

.L_empty:
    ret

.section .note.GNU-stack,"",@progbits
