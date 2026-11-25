.global ticket_lock_init
.global ticket_lock_acquire
.global ticket_lock_release
.type ticket_lock_init, %function
.type ticket_lock_acquire, %function
.type ticket_lock_release, %function
.text

// Packed layout (little-endian): [x0+0..1] = next (u16), [x0+2..3] = owner (u16)
ticket_lock_init:
    str wzr, [x0]
    ret

ticket_lock_acquire:
.L_request_ticket:
    ldaxr w1, [x0]
    // Increment only lower 16-bit 'next' without carrying overflow into upper 'owner' field
    and w2, w1, #0xffff
    add w2, w2, #1
    and w2, w2, #0xffff
    and w3, w1, #0xffff0000
    orr w2, w2, w3
    stlxr w3, w2, [x0]
    cbnz w3, .L_request_ticket

    lsr w4, w1, #16
    uxth w1, w1

.L_wait_turn:
    cmp w1, w4
    b.eq .L_acquired
    wfe
    ldar w4, [x0]
    lsr w4, w4, #16
    b .L_wait_turn

.L_acquired:
    dmb ish
    ret

ticket_lock_release:
    // Release-store strictly to upper 16-bit 'owner' halfword so concurrent 'next' acquires are never overwritten
    ldrh w1, [x0, #2]
    add w1, w1, #1
    stlrh w1, [x0, #2]
    sev
    ret

.size ticket_lock_init, .-ticket_lock_init
.size ticket_lock_acquire, .-ticket_lock_acquire
.size ticket_lock_release, .-ticket_lock_release
.section .note.GNU-stack,"",%progbits
