import sys
import argparse
import unicodedata

def get_char_width(char, ambiguous_width=1):
    if char == '\t':
        return -1
    eaw = unicodedata.east_asian_width(char)
    if eaw in ('W', 'F'):
        return 2
    if eaw == 'A':
        return ambiguous_width
    return 1

def get_line_visual_width(line, ambiguous_width=1):
    width = 0
    has_tab = False
    for c in line:
        w = get_char_width(c, ambiguous_width)
        if w == -1:
            has_tab = True
            width += 4
        else:
            width += w
    return width, has_tab

def extract_code_blocks(text):
    lines = text.splitlines()
    blocks = []
    current_block = []
    in_block = False
    start_line = 0

    for idx, line in enumerate(lines, 1):
        if line.strip().startswith('```'):
            if in_block:
                blocks.append((start_line, current_block))
                current_block = []
                in_block = False
            else:
                in_block = True
                start_line = idx + 1
        elif in_block:
            current_block.append(line)

    if in_block and current_block:
        blocks.append((start_line, current_block))

    return blocks if blocks else [(1, lines)]

def audit_diagram(lines, start_line_num=1, ambiguous_width=1):
    errors = []
    warnings = []
    line_details = []

    for rel_idx, line in enumerate(lines):
        abs_idx = start_line_num + rel_idx
        v_width, has_tab = get_line_visual_width(line, ambiguous_width)
        line_details.append((abs_idx, v_width, line))

        if has_tab:
            errors.append(f"Line {abs_idx}: Contains tab character. Tab characters break terminal monospace alignment. Replace with spaces.")

    box_delimiters = {'+', '┌', '┍', '┏', '╔', '╭', '└', '┕', '┗', '╚', '╰', '|', '│', '┃', '║'}
    active_box_widths = []

    for abs_idx, v_width, line in line_details:
        stripped = line.strip()
        if not stripped:
            continue
        first_char = stripped[0]
        last_char = stripped[-1]
        
        if first_char in ('+', '┌', '┏', '╔', '╭') and last_char in ('+', '┐', '┓', '╗', '╮'):
            active_box_widths.append((abs_idx, v_width, 'top'))
        elif first_char in ('+', '└', '┗', '╚', '╰') and last_char in ('+', '┘', '┛', '╝', '╯'):
            active_box_widths.append((abs_idx, v_width, 'bottom'))
        elif first_char in ('|', '│', '┃', '║') and last_char in ('|', '│', '┃', '║'):
            active_box_widths.append((abs_idx, v_width, 'body'))

    return errors, warnings, line_details

def main():
    parser = argparse.ArgumentParser(description="Deterministic ASCII & Unicode Diagram Alignment Validator")
    parser.add_argument("--file", "-f", required=True, help="Path to markdown or text file containing diagram")
    parser.add_argument("--ambiguous-width", "-a", type=int, default=1, choices=[1, 2], help="Width for East Asian Ambiguous characters (default: 1)")
    args = parser.parse_args()

    with open(args.file, "r", encoding="utf-8") as f:
        content = f.read()

    blocks = extract_code_blocks(content)
    total_errors = 0
    total_blocks = len(blocks)

    print(f"Auditing {total_blocks} diagram block(s) in {args.file}...")

    for block_idx, (start_line, block_lines) in enumerate(blocks, 1):
        errors, warnings, line_details = audit_diagram(block_lines, start_line, args.ambiguous_width)
        print(f"\n--- Diagram Block {block_idx} (Lines {start_line}-{start_line + len(block_lines) - 1}) ---")
        
        for abs_idx, v_width, line in line_details:
            prefix = f"L{abs_idx:03d} (col={v_width:02d}): "
            print(f"{prefix}{line}")

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
    else:
        print("\nAll diagram blocks verified successfully.")
        sys.exit(0)

if __name__ == "__main__":
    main()
