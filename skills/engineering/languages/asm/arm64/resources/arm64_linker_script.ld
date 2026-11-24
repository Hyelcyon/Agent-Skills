ENTRY(_start)

SECTIONS
{
    . = 0x400000;

    .text : ALIGN(0x10000)
    {
        *(.text._start)
        *(.text .text.*)
    }

    .rodata : ALIGN(0x10000)
    {
        *(.rodata .rodata.*)
    }

    .data : ALIGN(0x10000)
    {
        *(.data .data.*)
    }

    .bss : ALIGN(0x10000)
    {
        *(.bss .bss.*)
        *(COMMON)
    }

    /DISCARD/ :
    {
        *(.comment)
        *(.note.GNU-stack)
    }
}
