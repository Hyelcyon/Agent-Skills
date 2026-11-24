#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>

#if defined(__x86_64__)
static inline uint64_t get_cycle_count(void) {
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
#elif defined(__aarch64__)
static inline uint64_t get_cycle_count(void) {
    uint64_t val;
    __asm__ volatile("mrs %0, cntvct_el0" : "=r"(val));
    return val;
}
#endif

void run_benchmark(const char *name, void (*fn)(void*, size_t), void *buf, size_t size, uint64_t iterations) {
    for (uint64_t i = 0; i < 100; ++i) {
        fn(buf, size);
    }

    uint64_t start = get_cycle_count();
    for (uint64_t i = 0; i < iterations; ++i) {
        fn(buf, size);
    }
    uint64_t end = get_cycle_count();

    uint64_t total_cycles = end - start;
    double cycles_per_iter = (double)total_cycles / (double)iterations;
    double bytes_per_cycle = ((double)size * (double)iterations) / (double)total_cycles;

    printf("Kernel: %-24s | Cycles/Iter: %10.2f | Bytes/Cycle: %6.2f\n",
           name, cycles_per_iter, bytes_per_cycle);
}
