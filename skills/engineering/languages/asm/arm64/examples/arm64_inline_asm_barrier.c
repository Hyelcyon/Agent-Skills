#include <stdint.h>
#include <stdbool.h>

typedef struct {
    uint64_t data;
    uint32_t ready;
} channel_t;

void channel_send(channel_t *chan, uint64_t value) {
    chan->data = value;
    __asm__ volatile (
        "stlr %w1, [%0]"
        :
        : "r"(&chan->ready), "r"(1)
        : "memory"
    );
}

bool channel_try_receive(channel_t *chan, uint64_t *out_val) {
    uint32_t is_ready;
    __asm__ volatile (
        "ldar %w0, [%1]"
        : "=r"(is_ready)
        : "r"(&chan->ready)
        : "memory"
    );

    if (is_ready == 0) {
        return false;
    }

    *out_val = chan->data;
    return true;
}
