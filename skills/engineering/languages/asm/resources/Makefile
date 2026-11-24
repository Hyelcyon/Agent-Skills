CC = gcc
CFLAGS = -Wall -Wextra -Werror -pedantic -O3 -fPIE -z noexecstack
ASFLAGS = --fatal-warnings

SRCS_S = $(wildcard examples/*.s)
OBJS_S = $(SRCS_S:.s=.o)

BENCH_SRC = resources/asm_benchmark_harness.c
BENCH_BIN = bin/benchmark_runner

all: $(BENCH_BIN)

$(BENCH_BIN): $(OBJS_S) $(BENCH_SRC)
	@mkdir -p bin
	$(CC) $(CFLAGS) -o $@ $(BENCH_SRC) $(OBJS_S)

%.o: %.s
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -rf $(OBJS_S) bin

.PHONY: all clean
