.intel_syntax noprefix
.global spinlock_acquire
.global spinlock_release
.text

spinlock_acquire:
.L_spin_test:
    mov eax, 1
    xchg dword ptr [rdi], eax
    test eax, eax
    jz .L_acquire_success

.L_spin_wait:
    pause
    cmp dword ptr [rdi], 0
    jne .L_spin_wait
    jmp .L_spin_test

.L_acquire_success:
    ret

spinlock_release:
    mov dword ptr [rdi], 0
    ret

.section .note.GNU-stack,"",@progbits
