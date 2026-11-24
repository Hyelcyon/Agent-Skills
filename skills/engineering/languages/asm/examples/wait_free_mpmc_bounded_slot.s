.intel_syntax noprefix
.global mpmc_claim_producer_slot
.global mpmc_claim_consumer_slot
.type mpmc_claim_producer_slot, @function
.type mpmc_claim_consumer_slot, @function
.text

.p2align 6
mpmc_claim_producer_slot:
    mov rax, 1
    lock xadd qword ptr [rdi], rax
    ret

.p2align 6
mpmc_claim_consumer_slot:
    mov rax, 1
    lock xadd qword ptr [rdi + 64], rax
    ret

.size mpmc_claim_producer_slot, .-mpmc_claim_producer_slot
.size mpmc_claim_consumer_slot, .-mpmc_claim_consumer_slot
.section .note.GNU-stack,"",@progbits
