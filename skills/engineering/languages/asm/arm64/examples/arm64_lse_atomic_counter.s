.global lse_atomic_increment
.global lse_atomic_cas
.type lse_atomic_increment, %function
.type lse_atomic_cas, %function

lse_atomic_increment:
    mov w1, #1
    ldaddal w1, w2, [x0]
    mov w0, w2
    ret

lse_atomic_cas:
    casal w1, w2, [x0]
    mov w0, w1
    ret

.size lse_atomic_increment, .-lse_atomic_increment
.size lse_atomic_cas, .-lse_atomic_cas
.section .note.GNU-stack,"",%progbits
