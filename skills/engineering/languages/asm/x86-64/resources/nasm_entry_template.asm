default rel

global _start

section .rodata
    msg: db "Assembly operational", 10
    msg_len: equ $ - msg

section .text

_start:
    push rbp
    mov rbp, rsp
    sub rsp, 16

    mov rax, 1
    mov rdi, 1
    lea rsi, [msg]
    mov rdx, msg_len
    syscall

    mov rax, 60
    xor rdi, rdi
    syscall

section .note.GNU-stack noalloc noexec nowrite progbits
