import argparse
import sys
import unicodedata

STYLES = {
    "light": {
        "tl": "┌",
        "tr": "┐",
        "bl": "└",
        "br": "┘",
        "h": "─",
        "v": "│",
        "ml": "├",
        "mr": "┤",
    },
    "rounded": {
        "tl": "╭",
        "tr": "╮",
        "bl": "╰",
        "br": "╯",
        "h": "─",
        "v": "│",
        "ml": "├",
        "mr": "┤",
    },
    "double": {
        "tl": "╔",
        "tr": "╗",
        "bl": "╚",
        "br": "╝",
        "h": "═",
        "v": "║",
        "ml": "╠",
        "mr": "╣",
    },
    "ascii": {
        "tl": "+",
        "tr": "+",
        "bl": "+",
        "br": "+",
        "h": "-",
        "v": "|",
        "ml": "+",
        "mr": "+",
    },
}


def get_char_width(char: str, ambiguous_width: int = 1) -> int:
    """Return terminal display columns for a single Unicode scalar value per UAX #11."""
    if unicodedata.combining(char) or unicodedata.category(char) in ("Mn", "Me", "Cf"):
        return 0
    eaw = unicodedata.east_asian_width(char)
    if eaw in ("W", "F"):
        return 2
    if eaw == "A":
        return ambiguous_width
    return 1


def get_visual_width(text: str, ambiguous_width: int = 1) -> int:
    """Compute monospace terminal display width after tab normalization."""
    normalized = text.replace("\t", "    ")
    return sum(get_char_width(ch, ambiguous_width) for ch in normalized)


def pad_to_visual_width(
    text: str,
    target_width: int,
    ambiguous_width: int = 1,
    align: str = "left",
) -> str:
    """Pad a single line to `target_width` visual columns using ASCII spaces only."""
    normalized = text.replace("\t", "    ")
    current = get_visual_width(normalized, ambiguous_width)
    if current >= target_width:
        return normalized
    remaining = target_width - current
    if align == "center":
        left_pad = remaining // 2
        right_pad = remaining - left_pad
        return (" " * left_pad) + normalized + (" " * right_pad)
    return normalized + (" " * remaining)


def render_box(
    title: str,
    lines: list[str],
    style: str = "light",
    ambiguous_width: int = 1,
    align: str = "left",
) -> str:
    """Render a mathematically aligned text box in the chosen character family."""
    st = STYLES.get(style, STYLES["light"])
    norm_title = title.replace("\t", "    ")
    norm_lines = [line.replace("\t", "    ") for line in lines]

    all_texts = [norm_title] + norm_lines if norm_title else norm_lines
    content_max_w = max((get_visual_width(t, ambiguous_width) for t in all_texts), default=20)
    box_inner_w = max(content_max_w + 4, 30)

    out = [st["tl"] + st["h"] * box_inner_w + st["tr"]]

    if norm_title:
        inner_title = norm_title if align == "center" else f" {norm_title} "
        title_padded = pad_to_visual_width(inner_title, box_inner_w, ambiguous_width, align=align)
        out.append(st["v"] + title_padded + st["v"])
        out.append(st["ml"] + st["h"] * box_inner_w + st["mr"])

    for line in norm_lines:
        inner_line = line if align == "center" else f" {line} "
        padded = pad_to_visual_width(inner_line, box_inner_w, ambiguous_width, align=align)
        out.append(st["v"] + padded + st["v"])

    out.append(st["bl"] + st["h"] * box_inner_w + st["br"])
    return "\n".join(out)


def main() -> None:
    parser = argparse.ArgumentParser(description="Deterministic ASCII/Unicode Box Renderer")
    parser.add_argument("--title", "-t", default="", help="Box title")
    parser.add_argument("--lines", "-l", nargs="+", default=[], help="Content lines")
    parser.add_argument(
        "--style",
        "-s",
        default="light",
        choices=sorted(STYLES.keys()),
        help="Box-drawing character family",
    )
    parser.add_argument(
        "--align",
        default="left",
        choices=["left", "center"],
        help="Text alignment inside box",
    )
    parser.add_argument(
        "--ambiguous-width",
        "-a",
        type=int,
        default=1,
        choices=[1, 2],
        help="Column width for East Asian Ambiguous characters",
    )
    args = parser.parse_args()

    if args.title or args.lines:
        print(
            render_box(
                args.title,
                args.lines,
                style=args.style,
                ambiguous_width=args.ambiguous_width,
                align=args.align,
            )
        )
    else:
        parser.print_help(sys.stderr)
        sys.exit(2)


if __name__ == "__main__":
    main()
