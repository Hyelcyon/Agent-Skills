import sys
import argparse
import unicodedata

def get_visual_width(s: str, ambiguous_width: int = 1) -> int:
    w = 0
    for ch in s:
        if ch == '\t':
            w += 4
            continue
        eaw = unicodedata.east_asian_width(ch)
        if eaw in ('W', 'F'):
            w += 2
        elif eaw == 'A':
            w += ambiguous_width
        else:
            w += 1
    return w

def pad_to_visual_width(s: str, target_width: int, ambiguous_width: int = 1) -> str:
    current = get_visual_width(s, ambiguous_width)
    if current >= target_width:
        return s
    return s + ' ' * (target_width - current)

def render_box(title: str, lines: list[str], style: str = "light", ambiguous_width: int = 1) -> str:
    styles = {
        "light": {
            "tl": "┌", "tr": "┐", "bl": "└", "br": "┘", "h": "─", "v": "│",
            "ml": "├", "mr": "┤"
        },
        "rounded": {
            "tl": "╭", "tr": "╮", "bl": "╰", "br": "╯", "h": "─", "v": "│",
            "ml": "├", "mr": "┤"
        },
        "ascii": {
            "tl": "+", "tr": "+", "bl": "+", "br": "+", "h": "-", "v": "|",
            "ml": "+", "mr": "+"
        }
    }
    
    st = styles.get(style, styles["light"])
    
    all_texts = [title] + lines if title else lines
    content_max_w = max((get_visual_width(t, ambiguous_width) for t in all_texts), default=20)
    box_inner_w = max(content_max_w + 4, 30)
    
    out = []
    
    # Top border
    out.append(st["tl"] + st["h"] * box_inner_w + st["tr"])
    
    # Title
    if title:
        title_padded = pad_to_visual_width(f" {title} ", box_inner_w, ambiguous_width)
        out.append(st["v"] + title_padded + st["v"])
        out.append(st["ml"] + st["h"] * box_inner_w + st["mr"])
        
    # Lines
    for line in lines:
        padded = pad_to_visual_width(f" {line} ", box_inner_w, ambiguous_width)
        out.append(st["v"] + padded + st["v"])
        
    # Bottom border
    out.append(st["bl"] + st["h"] * box_inner_w + st["br"])
    
    return "\n".join(out)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Deterministic ASCII/Unicode Box Renderer")
    parser.add_argument("--title", "-t", default="", help="Box title")
    parser.add_argument("--lines", "-l", nargs="+", default=[], help="Content lines")
    parser.add_argument("--style", "-s", default="light", choices=["light", "rounded", "ascii"])
    args = parser.parse_args()
    
    print(render_box(args.title, args.lines, args.style))
