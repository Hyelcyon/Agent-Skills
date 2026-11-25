CC ?= gcc
ARCH := $(shell uname -m)
CFLAGS = -Wall -Wextra -Werror -pedantic -O3 -fPIE
LDFLAGS = -Wl,-z,noexecstack
ASFLAGS = -Wa,--fatal-warnings

ifeq ($(ARCH),aarch64)
SRCS_S = examples/neon_swar_bit_matrix_transpose.s
else
SRCS_S = examples/avx2_fast_utf8_ascii_validator.s examples/non_temporal_streaming_copy.s examples/branchless_itoa_swar.s examples/wait_free_mpmc_bounded_slot.s
CFLAGS += -mavx2
endif

OBJS_S = $(SRCS_S:.s=.o)
BENCH_SRC = resources/asm_benchmark_harness.c
BENCH_BIN = bin/benchmark_runner

all: $(BENCH_BIN)

$(BENCH_BIN): $(OBJS_S) $(BENCH_SRC)
	@mkdir -p bin
	$(CC) $(CFLAGS) $(LDFLAGS) -o $@ $(BENCH_SRC) $(OBJS_S)

%.o: %.s
	$(CC) $(CFLAGS) $(ASFLAGS) -c $< -o $@

clean:
	rm -f $(OBJS_S)
	rm -rf bin

.PHONY: all clean
