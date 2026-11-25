# CJK & Unicode East Asian Width Handling

This reference defines the Unicode character width standards, column evaluation algorithms, and padding adjustments required when embedding Korean, Japanese, Chinese, and non-ASCII glyphs inside text diagrams.

---

## 1. The East Asian Width Specification (Unicode Standard Annex #11)

In monospaced terminals, code editors, and Markdown rendering engines, characters do not occupy uniform visual width across character sets. The Unicode Consortium classifies code points under UAX #11 into six categories:

| Property | Description | Examples | Terminal Visual Width |
| :--- | :--- | :--- | :--- |
| **`W` (Wide)** | Characters natively wide (CJK ideographs, Hangul, Kana) | `가`, `한`, `字`, `あ` | **2 columns** |
| **`F` (Fullwidth)** | Fullwidth variants of ASCII characters & punctuation | `Ａ`, `１`, `！`, `：` | **2 columns** |
| **`Na` (Narrow)** | Traditional ASCII characters and symbols | `A`, `1`, `!`, `-` | **1 column** |
| **`H` (Halfwidth)** | Halfwidth Katakana and punctuation | `ｦ`, `ｱ`, `ﾜ` | **1 column** |
| **`N` (Neutral)** | Standard European scripts, digits, symbols | `á`, `Ω`, `β` | **1 column** |
| **`A` (Ambiguous)** | Characters whose width depends on context / locale | `┌`, `─`, `■`, `§` | **1 column** (Modern UTF-8 code editors) |

---

## 2. The Core Failure Mode: `len()` vs. Display Width

Standard programming runtime functions (`len()` in Python, `.length` in JavaScript, `.len()` in Rust) count Unicode scalar values, code units, or UTF-8 bytes. They do **not** measure terminal column consumption.

### Failure Demonstration
Consider the Korean label: `"사용자 요청"` (User Request).

- **Character Count (`len`)**: 6 (5 Hangul syllables + 1 space).
- **True Display Width ($W_v$)**:
  $$W_v = (5 \times 2) + (1 \times 1) = 11 \text{ columns}$$

If an agent calculates box interior width as 18 and determines padding via:
$$P = 18 - \text{len}(\text{"사용자 요청"}) = 18 - 6 = 12 \text{ trailing spaces}$$
The resulting interior renders as:
$$1 \text{ (leading)} + 11 \text{ (label)} + 12 \text{ (trailing)} = 24 \text{ interior columns}$$
Including the two `|` borders, the line renders at 26 columns instead of 20, shattering the box:

```text
+------------------+   <-- Width: 20 columns
| 사용자 요청            | <-- Visual Width: 26 columns! Shattered boundary!
+------------------+
```

---

## 3. The Visual Width Calculation Algorithm

To achieve pixel-perfect monospace alignment across multilingual labels, determine width using:

$$W_v(S) = \sum_{c \in S} \text{col\_width}(c)$$

$$\text{col\_width}(c) = \begin{cases} 2 & \text{if } \text{eaw}(c) \in \{'W', 'F'\} \\ 1 & \text{otherwise} \end{cases}$$

### Python Implementation Pattern
```python
import unicodedata

def visual_width(text: str, ambiguous_width: int = 1) -> int:
    width = 0
    for char in text:
        if unicodedata.combining(char) or unicodedata.category(char) in ("Mn", "Me", "Cf"):
            continue
        eaw = unicodedata.east_asian_width(char)
        if eaw in ("W", "F"):
            width += 2
        elif eaw == "A":
            width += ambiguous_width
        else:
            width += 1
    return width
```

---

## 4. Multilingual Box Padding Protocol

When authoring a box containing CJK text:

1. **Fix Desired Outer Box Width ($W_{\text{box}}$)**: e.g. 24 columns.
2. **Determine Inner Width ($W_{\text{inner}}$)**:
   $$W_{\text{inner}} = W_{\text{box}} - 2 = 22 \text{ columns}$$
3. **Compute Visual Width of Content ($W_v$)**:
   For `"주문 처리 서비스"` (7 Hangul syllables + 2 spaces):
   $$W_v = (7 \times 2) + (2 \times 1) = 16 \text{ columns}$$
4. **Compute Space Padding**:
   $$\text{Remaining Space} = W_{\text{inner}} - W_v = 22 - 16 = 6 \text{ spaces}$$
   $$P_{\text{left}} = 3 \text{ spaces}, \quad P_{\text{right}} = 3 \text{ spaces}$$
5. **Verified Monospace Assembly**:
   ```text
   +----------------------+   (24 cols)
   |   주문 처리 서비스   |   (1 + 3 + 16 + 3 + 1 = 24 cols)
   +----------------------+   (24 cols)
   ```
   The right border aligns with mathematical precision.
