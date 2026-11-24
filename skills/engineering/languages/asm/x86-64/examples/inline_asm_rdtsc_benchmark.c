#include <stdio.h>
#include <stdint.h>

static inline uint64_t rdtsc_start(void) {
    uint32_t lo;
    uint32_t hi;
    __asm__ volatile (
        "cpuid\n\t"
        "rdtsc\n\t"
        : "=a"(lo), "=d"(hi)
        : "a"(0)
        : "rbx", "rcx"
    );
    return ((uint64_t)hi << 32) | lo;
}

static inline uint64_t rdtsc_end(void) {
    uint32_t lo;
    uint32_t hi;
    __asm__ volatile (
        "rdtscp\n\t"
        "mov %%eax, %0\n\t"
        "mov %%edx, %1\n\t"
        "cpuid\n\t"
        : "=r"(lo), "=r"(hi)
        :
        : "rax", "rbx", "rcx", "rdx"
    );
    return ((uint64_t)hi << 32) | lo;
}

uint64_t benchmark_computation(uint64_t iterations) {
    uint64_t accumulator = 0;
    uint64_t t0 = rdtsc_start();

    for (uint64_t i = 0; i < iterations; ++i) {
        accumulator += (i * 31) ^ (i >> 3);
    }

    uint64_t t1 = rdtsc_end();
    printf("Total cycles: %llu, Accumulator: %llu\n", (unsigned long long)(t1 - t0), (unsigned long long)accumulator);
    return accumulator;
}
