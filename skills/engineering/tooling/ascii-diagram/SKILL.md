---
name: ascii-diagram
description: Use when generating, formatting, or debugging ASCII diagrams, text-based architecture charts, box-drawing flowcharts, sequence diagrams, terminal tables, or fixing misaligned text boxes and CJK visual width errors.
---

# Senior ASCII & Unicode Diagram Engineering

Production runbook and operational standard for authoring deterministic, distortion-free text diagrams, system architecture charts, and terminal tables across ASCII and Unicode monospace environments.

## When to Use
- Generating system architecture, microservice topologies, or data pipelines in plaintext Markdown.
- Designing branching flowcharts, decision diamonds, or finite state machine transitions in comments or documentation.
- Rendering sequence diagrams, lifeline interactions, or network call flows in terminal viewports.
- Eliminating box border displacement, jagged lines, or broken right-side boundaries caused by Korean, Japanese, Chinese (CJK), or multibyte Unicode characters.
- Auditing and validating diagram buffer integrity, eliminating tab characters, and enforcing symmetric column alignments.

## When NOT to Use
- Authoring rich interactive web diagrams or vector assets (use Mermaid, PlantUML, or SVG).
- Generating pixel-based screenshots, slides, or UI wireframes (use Figma or canvas skills).

---

## 1. 5-Phase Agent Operational Protocol

When designing or repairing text-based diagrams, execute through these 5 sequential phases:

```text
┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
│ 1. Geometry       │──►│ 2. Width Shield   │──►│ 3. Render & Draw  │
│    & Char Family  │   │    UAX #11 + 0Tab │   │    render_box.py  │
└───────────────────┘   └───────────────────┘   └─────────┬─────────┘
                                                          │
┌───────────────────┐   ┌───────────────────┐             │
│ 5. Verified Block │◄──│ 4. Script Audit   │◄────────────┘
│    Fenced `text`  │   │ verify_ascii_...  │
└───────────────────┘   └───────────────────┘
```

### Phase 1: Geometry Profiling & Character Family Selection
1. Establish total canvas width (e.g. 61, 71, or 80 columns) and target layout topology (vertical pipeline, parallel columns, branching flow).
2. Select a single, uniform character set family across the entire diagram:
   - **Pure ASCII**: `+`, `-`, `|`, `^`, `v`, `-->` (maximum portability).
   - **Unicode Light**: `┌`, `─`, `┐`, `│`, `└`, `┘`, `┬`, `┴`, `├`, `┤`, `┼`, `▼` (modern default).
   - **Unicode Rounded**: `╭`, `─`, `╮`, `│`, `╰`, `╯`, `▼` (high-polish documentation).
3. **Strict Prohibition**: Never mix character sets within the same diagram (e.g. `+` corners with `│` borders).

### Phase 2: Coordinate Grid & Width Shielding (The CJK Invariant)
1. **The Zero-Tab Invariant**: Never use tab characters (`\t`). Indent and space exclusively with ASCII space characters (`U+0020`).
2. **Visual Width Calculation (UAX #11)**: Never rely on `len()` or character counts when CJK glyphs are present.
   $$\text{Visual Width} = \sum (\text{Wide/Fullwidth}=2, \text{Narrow/Neutral}=1)$$
3. **Symmetric Padding Computation**:
   $$P_{\text{left}} = \lfloor \frac{W_{\text{inner}} - W_{\text{visual}}}{2} \rfloor, \quad P_{\text{right}} = W_{\text{inner}} - W_{\text{visual}} - P_{\text{left}}$$

### Phase 3: Deterministic Surgical Drawing
1. Use the bundled box renderer for single/titled component boxes instead of eyeballing widths:
   ```bash
   python skills/engineering/tooling/ascii-diagram/scripts/render_box.py --title "Service" --lines "Line 1" "Line 2" --style rounded
   ```
2. For multi-box architectures, construct boxes on an explicit 2D coordinate grid. Ensure top border, label row, and bottom border have identical visual column widths.
3. Align vertical connectors with exact center columns:
   $$X_{\text{connector}} = X_{\text{box\_start}} + \lfloor \frac{W_{\text{box}}}{2} \rfloor$$
4. Use exact junction glyphs (`┬`, `┴`, `├`, `┤`, `┼`) where paths meet box edges.

### Phase 4: Automated Verification via Script
Validate diagram buffers using the bundled offline validator:
```bash
python skills/engineering/tooling/ascii-diagram/scripts/verify_ascii_diagram.py --file <path_to_diagram.md>
```
Ensure zero reported errors, zero tabs, and strict column width equality.

### Phase 5: Transparent Proof & Delivery
Render the final diagram inside a fenced Markdown code block (` ```text `) with verified row-by-row symmetry.

---

## 2. Character Palette Quick Reference

| Role | Pure ASCII | Unicode Light | Unicode Rounded | Unicode Double |
| :--- | :---: | :---: | :---: | :---: |
| Top-Left Corner | `+` | `┌` | `╭` | `╔` |
| Top-Right Corner | `+` | `┐` | `╮` | `╗` |
| Bottom-Left Corner | `+` | `└` | `╰` | `╚` |
| Bottom-Right Corner | `+` | `┘` | `╯` | `╝` |
| Horizontal Line | `-` | `─` | `─` | `═` |
| Vertical Line | `\|` | `│` | `│` | `║` |
| T-Junction Down | `+` | `┬` | `┬` | `╦` |
| T-Junction Up | `+` | `┴` | `┴` | `╩` |
| 4-Way Intersection | `+` | `┼` | `┼` | `╬` |
| Down Arrow | `v` | `▼` | `▼` | `▼` |
| Right Arrow | `>` | `►` | `►` | `►` |

---

## 3. Prohibited Anti-Patterns & Fatal Mistakes

- ❌ **Eyeballing 2D padding in prose**: Autoregressive prediction miscounts spaces, especially around CJK wide glyphs (`width = 2`). Always verify via `verify_ascii_diagram.py`.
- ❌ **Using `len()` instead of UAX #11 display width**: Counting Hangul/ideograph code points as 1 column shifts right box borders outward.
- ❌ **Injecting tab characters (`\t`)**: Variable tab stops destroy alignment across editors and Markdown renderers.
- ❌ **Mixing character families**: Combining `+`/`|` with `┌`/`─`/`│`, or square `┌┐` with rounded `╰╯`, breaks visual geometry.
- ❌ **Off-center vertical connectors**: Routing `│`/`▼` one column off `X_box_start + floor(W_box / 2)` warps pipelines.

---

## 4. Specialized Architecture References
- 2D Grid Theory & Spatial Alignment: [references/ascii-grid-and-spatial-alignment.md](./references/ascii-grid-and-spatial-alignment.md)
- CJK & Unicode East Asian Width Handling: [references/cjk-and-unicode-width-handling.md](./references/cjk-and-unicode-width-handling.md)
- Box-Drawing Character Sets & Syntax: [references/box-drawing-character-sets-and-syntax.md](./references/box-drawing-character-sets-and-syntax.md)

## 5. Reusable Resources & Scripts
- Box-Drawing Character Palette: [resources/box-drawing-palette.json](./resources/box-drawing-palette.json)
- Pre-Measured Diagram Templates: [resources/diagram-templates.md](./resources/diagram-templates.md)
- Diagram Lint Rules Schema: [resources/diagram-lint-schema.json](./resources/diagram-lint-schema.json)
- Deterministic Box Renderer: [scripts/render_box.py](./scripts/render_box.py)
- Diagram Alignment Validator: [scripts/verify_ascii_diagram.py](./scripts/verify_ascii_diagram.py)

## 6. Verified Working Examples
- Baseline Service Architecture: [examples/baseline_service_architecture.md](./examples/baseline_service_architecture.md)
- Advanced Branching & Compensation Workflow: [examples/advanced_branching_workflow.md](./examples/advanced_branching_workflow.md)
- Multilingual CJK & Korean Enterprise Architecture: [examples/cjk_mixed_multilingual_diagram.md](./examples/cjk_mixed_multilingual_diagram.md)
