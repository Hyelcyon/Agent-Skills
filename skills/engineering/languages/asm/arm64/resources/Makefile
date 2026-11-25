CROSS_COMPILE ?= aarch64-linux-gnu-
CC = $(CROSS_COMPILE)gcc
AS = $(CROSS_COMPILE)as
LD = $(CROSS_COMPILE)ld

CFLAGS = -Wall -Wextra -Werror -pedantic -O3 -fPIE
LDFLAGS = -Wl,-z,noexecstack
ASFLAGS = --fatal-warnings -march=armv8-a+simd

SRC_C = $(wildcard src/*.c)
SRC_S = $(wildcard src/*.s)

OBJ_C = $(SRC_C:.c=.o)
OBJ_S = $(SRC_S:.s=.o)
ALL_OBJS = $(OBJ_C) $(OBJ_S)

TARGET = bin/arm64_app

all: $(TARGET)

$(TARGET): $(ALL_OBJS)
	@mkdir -p bin
	$(CC) $(CFLAGS) $(LDFLAGS) -o $@ $^

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

%.o: %.s
	$(AS) $(ASFLAGS) $< -o $@

clean:
	rm -rf $(ALL_OBJS) bin

.PHONY: all clean
