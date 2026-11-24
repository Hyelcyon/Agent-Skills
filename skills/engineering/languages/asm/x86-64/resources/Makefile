CC = gcc
AS = as
NASM = nasm
CFLAGS = -Wall -Wextra -Werror -pedantic -O3 -fPIE -z noexecstack
ASFLAGS = --fatal-warnings -O2
NASMFLAGS = -f elf64 -Werror -Ox

SRC_C = $(wildcard src/*.c)
SRC_S = $(wildcard src/*.s)
SRC_ASM = $(wildcard src/*.asm)

OBJ_C = $(SRC_C:.c=.o)
OBJ_S = $(SRC_S:.s=.o)
OBJ_ASM = $(SRC_ASM:.asm=.o)
ALL_OBJS = $(OBJ_C) $(OBJ_S) $(OBJ_ASM)

TARGET = bin/app

all: $(TARGET)

$(TARGET): $(ALL_OBJS)
	@mkdir -p bin
	$(CC) $(CFLAGS) -o $@ $^

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

%.o: %.s
	$(AS) $(ASFLAGS) $< -o $@

%.o: %.asm
	$(NASM) $(NASMFLAGS) $< -o $@

clean:
	rm -rf $(ALL_OBJS) bin

.PHONY: all clean
