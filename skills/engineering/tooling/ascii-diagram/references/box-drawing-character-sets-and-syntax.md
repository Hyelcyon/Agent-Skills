# Box-Drawing Character Sets & Syntax Specifications

This reference provides character sets, junction glyphs, arrow conventions, and styling rules for rendering ASCII and Unicode structural diagrams.

---

## 1. Character Set Families

A diagram must maintain 100% stylistic cohesion. Never mix glyphs across different character families within the same diagram.

### Family A: Pure ASCII (Maximum Portability)
Guaranteed to render identically across all environments, legacy terminals, plaintext emails, and CLI tools:

| Element | Glyph | Description |
| :--- | :--- | :--- |
| **Horizontal Border** | `-` | ASCII hyphen (`U+002D`) |
| **Vertical Border** | `\|` | ASCII vertical bar (`U+007C`) |
| **Corners / Junctions** | `+` | ASCII plus (`U+002B`) |
| **Arrows** | `-->`, `<--`, `v`, `^` | Standard keyboard ASCII sequences |

### Family B: Light Unicode Box Drawing (Modern Standard)
The standard choice for Markdown documentation, GitHub READMEs, and modern terminals:

| Element | Glyph | Unicode | Description |
| :--- | :--- | :--- | :--- |
| **Horizontal Line** | `─` | `U+2500` | Box Drawings Light Horizontal |
| **Vertical Line** | `│` | `U+2502` | Box Drawings Light Vertical |
| **Top-Left Corner** | `┌` | `U+250C` | Box Drawings Light Down and Right |
| **Top-Right Corner** | `┐` | `U+2510` | Box Drawings Light Down and Left |
| **Bottom-Left Corner** | `└` | `U+2514` | Box Drawings Light Up and Right |
| **Bottom-Right Corner** | `┘` | `U+2518` | Box Drawings Light Up and Left |
| **T-Junction Down** | `┬` | `U+252C` | Box Drawings Light Down and Horizontal |
| **T-Junction Up** | `┴` | `U+2534` | Box Drawings Light Up and Horizontal |
| **T-Junction Right** | `├` | `U+251C` | Box Drawings Light Vertical and Right |
| **T-Junction Left** | `┤` | `U+2524` | Box Drawings Light Vertical and Left |
| **Cross Junction** | `┼` | `U+253C` | Box Drawings Light Vertical and Horizontal |

### Family C: Rounded Unicode Box Drawing (Clean Presentation)
Commonly used for high-finish architectural diagrams:

| Element | Glyph | Unicode | Description |
| :--- | :--- | :--- | :--- |
| **Top-Left Corner** | `╭` | `U+256D` | Box Drawings Light Arc Down and Right |
| **Top-Right Corner** | `╮` | `U+256E` | Box Drawings Light Arc Down and Left |
| **Bottom-Left Corner** | `╰` | `U+2570` | Box Drawings Light Arc Up and Right |
| **Bottom-Right Corner** | `╯` | `U+256F` | Box Drawings Light Arc Up and Left |
| **Horizontal / Vertical**| `─`, `│` | `U+2500`, `U+2502` | Uses standard Light borders |

### Family D: Double-Line Unicode (Boundary Emphasis)
Used for outer system boundaries, secure enclaves, or database boundaries:

| Element | Glyph | Unicode | Description |
| :--- | :--- | :--- | :--- |
| **Horizontal / Vertical**| `═`, `║` | `U+2550`, `U+2551` | Double lines |
| **Corners** | `╔`, `╗`, `╚`, `╝`| `U+2554`, `U+2557`, `U+255A`, `U+255D` | Double corners |
| **Junctions** | `╦`, `╩`, `╠`, `╣`, `╬` | `U+2566`, `U+2569`, `U+2560`, `U+2563`, `U+256C` | Double junctions |

---

## 2. Directional Arrows and Connectors

Choose matching arrow glyphs according to the diagram family:

### Unicode Arrows
- Downward Flow: `▼` (`U+25BC`), `↓` (`U+2193`)
- Upward Flow: `▲` (`U+25B2`), `↑` (`U+2191`)
- Rightward Flow: `►` (`U+25BA`), `→` (`U+2192`)
- Leftward Flow: `◄` (`U+25C4`), `←` (`U+2190`)
- Bidirectional: `↕` (`U+2195`), `↔` (`U+2194`)

### ASCII Arrows
- Right: `-->` or `->`
- Left: `<--` or `<-`
- Down: `v` or `V`
- Up: `^`

---

## 3. Junction Truth Table

When two connector lines intersect, select the exact geometric junction symbol:

| Top Incoming | Bottom Outgoing | Left Incoming | Right Outgoing | Unicode Light Glyph | Pure ASCII Glyph |
| :---: | :---: | :---: | :---: | :---: | :---: |
| Yes | Yes | Yes | Yes | `┼` | `+` |
| No | Yes | Yes | Yes | `┬` | `+` |
| Yes | No | Yes | Yes | `┴` | `+` |
| Yes | Yes | No | Yes | `├` | `+` |
| Yes | Yes | Yes | No | `┤` | `+` |
| No | Yes | No | Yes | `┌` or `╭` | `+` |
| No | Yes | Yes | No | `┐` or `╮` | `+` |
| Yes | No | No | Yes | `└` or `╰` | `+` |
| Yes | No | Yes | No | `┘` or `╯` | `+` |

---

## 4. Prohibited Style Anti-Patterns

1. **Heterogeneous Corner Pairs**: Never start a box with `┌` and close it with `+` or `╯`.
2. **Tabbed Indentation**: Never indent diagram lines using `\t`.
3. **Ambiguous Staggered Arrows**: Never place an arrow glyph adjacent to a box without an aligned connecting pipe.
