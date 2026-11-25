import argparse
import re
import sys
import unicodedata

DIAGRAM_FENCE_LANGS = {"", "text", "txt", "plaintext", "ascii", "diagram"}

ASCII_BOX_RE = re.compile(r"\+(?:[-+]+)\+")
LIGHT_TOP_RE = re.compile(r"┌(?:[─┬┴]+)[┐]")
LIGHT_BOT_RE = re.compile(r"└(?:[─┴┬]+)[┘]")
LIGHT_MID_RE = re.compile(r"├(?:[─┼┬┴]+)[┤]")
ROUNDED_TOP_RE = re.compile(r"╭(?:[─┬┴]+)[╮]")
ROUNDED_BOT_RE = re.compile(r"╰(?:[─┴┬]+)[╯]")
DOUBLE_TOP_RE = re.compile(r"╔(?:[═╦╩]+)[╗]")
DOUBLE_BOT_RE = re.compile(r"╚(?:[═╩╦]+)[╝]")
DOUBLE_MID_RE = re.compile(r"╠(?:[═╬╦╩]+)[╣]")

UNICODE_BOX_CHARS = set("┌┐└┘─│┬┴├┤┼╭╮╰╯╔╗╚╝═║╦╩╠╣╬")
ASCII_BOX_CHARS = set("+-|")


def get_char_width(char: str, ambiguous_width: int = 1) -> int:
    """Return terminal display columns for a character, or -1 for prohibited tabs."""
    if char == "\t":
        return -1
    if unicodedata.combining(char) or unicodedata.category(char) in ("Mn", "Me", "Cf"):
        return 0
    eaw = unicodedata.east_asian_width(char)
    if eaw in ("W", "F"):
        return 2
    if eaw == "A":
        return ambiguous_width
    return 1


def get_line_visual_width(line: str, ambiguous_width: int = 1) -> tuple[int, bool]:
    """Compute total visual column width of a line and report tab presence."""
    width = 0
    has_tab = False
    for ch in line:
        w = get_char_width(ch, ambiguous_width)
        if w == -1:
            has_tab = True
            width += 4
        else:
            width += w
    return width, has_tab


def get_char_columns(line: str, ambiguous_width: int = 1) -> list[tuple[int, int, str]]:
    """Return `(start_col, end_col_exclusive, char)` for every character on a line."""
    spans: list[tuple[int, int, str]] = []
    col = 0
    for ch in line:
        w = get_char_width(ch, ambiguous_width)
        step = 4 if w == -1 else w
        spans.append((col, col + step, ch))
        col += step
    return spans


def visual_col_of_index(line: str, char_idx: int, ambiguous_width: int = 1) -> int:
    """Return visual column coordinate for a Python character index."""
    w, _ = get_line_visual_width(line[:char_idx], ambiguous_width)
    return w


def extract_code_blocks(
    text: str,
    include_all_fences: bool = False,
) -> list[tuple[int, list[str]]]:
    """Extract diagram code blocks from Markdown, or treat raw text as one block."""
    lines = text.splitlines()
    blocks: list[tuple[int, list[str]]] = []
    current_block: list[str] = []
    in_block = False
    current_lang = ""
    start_line = 0
    saw_fence = False

    for idx, line in enumerate(lines, 1):
        stripped = line.strip()
        if stripped.startswith("```"):
            saw_fence = True
            if in_block:
                if include_all_fences or current_lang in DIAGRAM_FENCE_LANGS:
                    blocks.append((start_line, current_block))
                current_block = []
                in_block = False
                current_lang = ""
            else:
                in_block = True
                current_lang = stripped[3:].strip().lower()
                start_line = idx + 1
        elif in_block:
            current_block.append(line)

    if in_block and current_block and (include_all_fences or current_lang in DIAGRAM_FENCE_LANGS):
        blocks.append((start_line, current_block))

    if saw_fence:
        return blocks
    return [(1, lines)]


def _find_horizontal_spans(
    line: str,
    pattern: re.Pattern[str],
    ambiguous_width: int,
) -> list[tuple[int, int]]:
    spans: list[tuple[int, int]] = []
    for m in pattern.finditer(line):
        start_col = visual_col_of_index(line, m.start(), ambiguous_width)
        end_col = visual_col_of_index(line, m.end() - 1, ambiguous_width)
        spans.append((start_col, end_col))
    return spans


def _detect_family_mixing(lines: list[str], start_line_num: int) -> list[str]:
    """Flag mixed box-border styles on lines that draw structural box edges."""
    errors: list[str] = []
    has_unicode_box = False
    has_ascii_box = False
    has_square_corners = False
    has_rounded_corners = False
    has_double_box = False

    for rel_idx, line in enumerate(lines):
        abs_idx = start_line_num + rel_idx
        chars = set(line)
        if chars & {"┌", "┐", "└", "┘"}:
            has_square_corners = True
        if chars & {"╭", "╮", "╰", "╯"}:
            has_rounded_corners = True
        if chars & {"╔", "╗", "╚", "╝", "═", "║"}:
            has_double_box = True
        if chars & UNICODE_BOX_CHARS:
            has_unicode_box = True
        if ASCII_BOX_RE.search(line) or (chars & {"|"} and "-" in chars):
            has_ascii_box = True
        if ("┌" in chars or "╭" in chars or "└" in chars or "╰" in chars) and "|" in chars:
            errors.append(
                f"Line {abs_idx}: Mixed Unicode box corners with ASCII '|' vertical borders."
            )
        if ("+" in chars and "─" in chars) or ("|" in chars and "─" in chars):
            errors.append(
                f"Line {abs_idx}: Mixed ASCII box glyphs ('+' or '|') with Unicode horizontal '─'."
            )

    if has_unicode_box and has_ascii_box:
        errors.append(
            f"Line {start_line_num}: Diagram mixes Unicode box borders with Pure ASCII box borders."
        )
    if has_square_corners and has_rounded_corners:
        errors.append(
            f"Line {start_line_num}: Diagram mixes square corners ('┌┐└┘') and rounded corners ('╭╮╰╯')."
        )
    if has_double_box and (has_square_corners or has_rounded_corners):
        errors.append(
            f"Line {start_line_num}: Diagram mixes Double-line boxes with Light/Rounded single-line boxes."
        )

    return errors


def _match_body_borders(
    abs_idx: int,
    line: str,
    ambiguous_width: int,
    open_boxes: dict[tuple[int, int], tuple[int, str]],
    family_vbar: str,
) -> list[str]:
    """Verify vertical box edges on body rows align with currently open box spans."""
    errors: list[str] = []
    if not open_boxes:
        return errors

    v_cols = [
        start_col
        for start_col, _end_col, ch in get_char_columns(line, ambiguous_width)
        if ch == family_vbar
    ]
    if not v_cols:
        return errors

    expected_edges: set[int] = set()
    for left, right in open_boxes:
        expected_edges.add(left)
        expected_edges.add(right)

    v_col_set = set(v_cols)
    for left, right in sorted(open_boxes):
        if left in v_col_set and right not in v_col_set:
            nearby = sorted(c for c in v_col_set if c > left and c not in expected_edges)
            if nearby:
                actual_right = nearby[0]
                errors.append(
                    f"Line {abs_idx}: Box body right border at col {actual_right} "
                    f"(width {actual_right - left + 1}) does not match header span "
                    f"[{left}..{right}] (expected width {right - left + 1})."
                )
            else:
                errors.append(
                    f"Line {abs_idx}: Open box [{left}..{right}] is missing right border '{family_vbar}' at col {right}."
                )
        elif right in v_col_set and left not in v_col_set:
            errors.append(
                f"Line {abs_idx}: Open box [{left}..{right}] is missing left border '{family_vbar}' at col {left}."
            )

    return errors


def _validate_boxes(
    lines: list[str],
    start_line_num: int,
    ambiguous_width: int,
) -> list[str]:
    """Track box top/body/bottom spans across rows and flag width or closure mismatches."""
    errors: list[str] = []
    open_boxes: dict[tuple[int, int], tuple[int, str]] = {}

    for rel_idx, line in enumerate(lines):
        abs_idx = start_line_num + rel_idx

        top_specs = [
            ("light", "│", _find_horizontal_spans(line, LIGHT_TOP_RE, ambiguous_width)),
            ("rounded", "│", _find_horizontal_spans(line, ROUNDED_TOP_RE, ambiguous_width)),
            ("double", "║", _find_horizontal_spans(line, DOUBLE_TOP_RE, ambiguous_width)),
        ]
        bot_specs = [
            ("light", _find_horizontal_spans(line, LIGHT_BOT_RE, ambiguous_width)),
            ("rounded", _find_horizontal_spans(line, ROUNDED_BOT_RE, ambiguous_width)),
            ("double", _find_horizontal_spans(line, DOUBLE_BOT_RE, ambiguous_width)),
        ]
        mid_specs = [
            ("light", _find_horizontal_spans(line, LIGHT_MID_RE, ambiguous_width)),
            ("double", _find_horizontal_spans(line, DOUBLE_MID_RE, ambiguous_width)),
        ]
        ascii_spans = _find_horizontal_spans(line, ASCII_BOX_RE, ambiguous_width)

        matched_horizontal = False

        for family, vbar, spans in top_specs:
            for span in spans:
                matched_horizontal = True
                if span in open_boxes:
                    errors.append(
                        f"Line {abs_idx}: Overlapping {family} box top border at cols [{span[0]}..{span[1]}]."
                    )
                open_boxes[span] = (abs_idx, vbar)

        for family, spans in bot_specs:
            for span in spans:
                matched_horizontal = True
                if span in open_boxes:
                    del open_boxes[span]
                else:
                    matching_left = [k for k in open_boxes if k[0] == span[0]]
                    if matching_left:
                        exp = matching_left[0]
                        errors.append(
                            f"Line {abs_idx}: Bottom border [{span[0]}..{span[1]}] width mismatch "
                            f"against open box [{exp[0]}..{exp[1]}] from line {open_boxes[exp][0]}."
                        )
                        del open_boxes[exp]
                    else:
                        errors.append(
                            f"Line {abs_idx}: Unmatched {family} bottom border at cols [{span[0]}..{span[1]}]."
                        )

        for family, spans in mid_specs:
            for span in spans:
                matched_horizontal = True
                if span not in open_boxes:
                    errors.append(
                        f"Line {abs_idx}: {family} divider [{span[0]}..{span[1]}] does not match any open box."
                    )

        for span in ascii_spans:
            matched_horizontal = True
            if span in open_boxes:
                del open_boxes[span]
            else:
                matching_left = [k for k in open_boxes if k[0] == span[0]]
                if matching_left:
                    exp = matching_left[0]
                    errors.append(
                        f"Line {abs_idx}: ASCII border [{span[0]}..{span[1]}] width mismatch "
                        f"against open box [{exp[0]}..{exp[1]}] from line {open_boxes[exp][0]}."
                    )
                    del open_boxes[exp]
                else:
                    open_boxes[span] = (abs_idx, "|")

        if open_boxes and not matched_horizontal:
            active_vbars = {vbar for _, vbar in open_boxes.values()}
            for vbar in sorted(active_vbars):
                scoped_boxes = {
                    k: v for k, v in open_boxes.items() if v[1] == vbar
                }
                errors.extend(
                    _match_body_borders(abs_idx, line, ambiguous_width, scoped_boxes, vbar)
                )

    for (left, right), (opened_line, _vbar) in sorted(open_boxes.items()):
        errors.append(
            f"Line {opened_line}: Box [{left}..{right}] was never closed with a matching bottom border."
        )

    return errors


def audit_diagram(
    lines: list[str],
    start_line_num: int = 1,
    ambiguous_width: int = 1,
    max_line_width: int = 120,
) -> tuple[list[str], list[str], list[tuple[int, int, str]]]:
    """Audit diagram lines for tabs, mixed glyph families, box span alignment, and max width."""
    errors: list[str] = []
    warnings: list[str] = []
    line_details: list[tuple[int, int, str]] = []

    for rel_idx, line in enumerate(lines):
        abs_idx = start_line_num + rel_idx
        v_width, has_tab = get_line_visual_width(line, ambiguous_width)
        line_details.append((abs_idx, v_width, line))

        if has_tab:
            errors.append(
                f"Line {abs_idx}: Contains tab character. Replace tabs with ASCII spaces (U+0020)."
            )
        if max_line_width > 0 and v_width > max_line_width:
            warnings.append(
                f"Line {abs_idx}: Visual width {v_width} exceeds maxLineWidth {max_line_width}."
            )

    errors.extend(_detect_family_mixing(lines, start_line_num))
    errors.extend(_validate_boxes(lines, start_line_num, ambiguous_width))

    return errors, warnings, line_details


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Deterministic ASCII & Unicode Diagram Alignment Validator"
    )
    parser.add_argument(
        "--file",
        "-f",
        required=True,
        help="Path to markdown or text file containing diagram",
    )
    parser.add_argument(
        "--ambiguous-width",
        "-a",
        type=int,
        default=1,
        choices=[1, 2],
        help="Width for East Asian Ambiguous characters (default: 1)",
    )
    parser.add_argument(
        "--max-width",
        type=int,
        default=120,
        help="Maximum recommended line width in visual columns (0 disables check)",
    )
    parser.add_argument(
        "--all-blocks",
        action="store_true",
        help="Inspect all fenced code blocks rather than diagram/text fences only",
    )
    args = parser.parse_args()

    with open(args.file, encoding="utf-8") as f:
        content = f.read()

    blocks = extract_code_blocks(content, include_all_fences=args.all_blocks)
    total_errors = 0

    print(f"Auditing {len(blocks)} diagram block(s) in {args.file}...")

    for block_idx, (start_line, block_lines) in enumerate(blocks, 1):
        errors, warnings, line_details = audit_diagram(
            block_lines,
            start_line,
            ambiguous_width=args.ambiguous_width,
            max_line_width=args.max_width,
        )
        end_line = start_line + len(block_lines) - 1
        print(f"\n--- Diagram Block {block_idx} (Lines {start_line}-{end_line}) ---")

        for abs_idx, v_width, line in line_details:
            print(f"L{abs_idx:03d} (col={v_width:02d}): {line}")

        if warnings:
            print(f"\n[WARN] {len(warnings)} warning(s):")
            for warn in warnings:
                print(f"  - {warn}")

        if errors:
            print(f"\n[FAIL] {len(errors)} error(s) detected:")
            for err in errors:
                print(f"  - {err}")
            total_errors += len(errors)
        else:
            print("\n[PASS] No alignment violations or prohibited characters detected.")

    if total_errors > 0:
        print(f"\nTotal verification failures: {total_errors}")
        sys.exit(1)

    print("\nAll diagram blocks verified successfully.")
    sys.exit(0)


if __name__ == "__main__":
    main()
