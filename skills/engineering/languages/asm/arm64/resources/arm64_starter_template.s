.global _start
.type _start, %function

.section .rodata
msg:
    .ascii "ARM64 runtime initialized\n"
msg_end:
    .equ msg_len, msg_end - msg

.section .text
_start:
    .cfi_startproc
    stp x29, x30, [sp, -16]!
    .cfi_def_cfa_offset 16
    .cfi_offset 29, -16
    .cfi_offset 30, -8
    mov x29, sp

    mov x8, #64
    mov x0, #1
    adrp x1, msg
    add x1, x1, :lo12:msg
    mov x2, msg_len
    svc #0

    mov x8, #93
    mov x0, #0
    svc #0
    .cfi_endproc

.size _start, .-_start
.section .note.GNU-stack,"",%progbits
