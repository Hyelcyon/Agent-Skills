---
name: design-taste
description: Use when establishing senior-level art direction, visual taste, editorial typography, OKLCH color restraint, asymmetric layout grids, physical motion curves, DESIGN.md branding, or critiquing and redesigning generic AI-looking UIs. Do NOT use solely for WCAG focus-trap plumbing or raw CSS syntax specs without aesthetic direction (pair with ui-ux).
---

# Senior Design Taste & Visual Craft

Art direction, typographic discipline, perceptual OKLCH color systems, optical geometry, and anti-AI-slop polish for building interfaces with unmistakable human studio craft.

## When to Use
- Designing landing pages, web apps, dashboards, or design systems that must look crafted by a senior design engineer rather than a generic template.
- Establishing a project's `DESIGN.md` visual thesis, font pairing, OKLCH tonal palette, surface hierarchy, and motion signature before coding.
- Auditing, distilling, or redesigning an existing UI that feels flat, cluttered, "template-like", or saturated with AI clichés.

## When NOT to Use
- Low-level WCAG 2.2 AA focus traps, native `<dialog>`/`popover` mechanics, and `@container` CSS architecture without art direction (use `ui-ux` alongside this skill).
- Drop-in interactive WebGL/shader background snippets (use `react-bits`).
- Core Web Vitals profiling and long-task scheduling (use `performance`).

---

## Fatal Mistakes Never to Make (Anti-AI-Slop)

- **Lila / Neon Gradient Ban**: Never default to indigo-purple-cyan gradients (`#6366f1` -> `#8b5cf6` -> `#06b6d4`), glowing neon borders, or dark rainbow orbs as a shortcut for "modern tech".
- **Font Monoculture Ban**: Never default blindly to unstyled `Inter` or generic system stacks with flat weight ratios. Commit to a deliberate Display + Body + Mono pairing (or Variable Sans with explicit OpenType stylistic sets `"ss02", "ss03"` paired with tight `-0.04em` to `-0.06em` `400/600` display tracking) and `65ch–72ch` prose measure.
- **Center-Bias & Card-Triplet Ban**: Never reflexively output a centered hero above three identical rounded icon cards wrapped in heavy drop-shadow boxes. Use asymmetric splits, `2:1 -> 1:1:1 -> full` alternating bento rhythms, hairline `1px` architectural grids, bottom-faded product UI canvases, and stepped surface lightness instead.
- **Decorative Clutter & Cliché Copy Ban**: Ban unmotivated pulsing status dots, badge confetti, excessive em-dashes (`—`), and hollow filler verbs (`"Unleash"`, `"Elevate"`, `"Seamless"`, `"Next-gen"`).
- **Cheap Motion & Unreviewed Shipping Ban**: Never ship `500ms ease` / `linear` UI transitions or deliver uninspected layouts. Apply weighted exponential/spring curves (`<= 240ms` micro-feedback) and run a Critique -> Distill -> Polish loop before finishing.

---

## The 3 Taste Dials (`1–10`)

Calibrate all three parameters against the user brief before writing markup or styles ([references/aesthetic-directions-and-dials.md](./references/aesthetic-directions-and-dials.md)):

| Dial | `1–3` (Restrained) | `4–7` (Editorial / Balanced) | `8–10` (Expressive / Dense) |
| :--- | :--- | :--- | :--- |
| **`DESIGN_VARIANCE`** | Clean symmetric SaaS grid | Split rails, varied bento spans | Asymmetric editorial / brutalist tension |
| **`MOTION_INTENSITY`** | Crisp hover & active micro-states | Staggered reveals & state physics | Scroll-linked choreography & shared layout |
| **`VISUAL_DENSITY`** | Airy gallery / luxury whitespace | Structured product storytelling | High-density Linear-grade cockpit |

---

## 5-Phase Agent Operational Protocol

```text
Phase 1: Aesthetic Thesis & Dial Calibration (DESIGN.md, Direction, 3 Dials)
Phase 2: Typography & OKLCH Tonal System (Non-cliche pairing, tinted neutrals, 1 accent)
Phase 3: Spatial Composition & Optical Geometry (Asymmetry, 1px hairlines, concentric radii)
Phase 4: Tactile Motion Physics & Micro-Craft (Exponential easing, active detent, reduced motion)
Phase 5: Critique, Distill & Visual Gate (Subtract noise, check contrast, verify viewport)
```

### Phase 1: Aesthetic Thesis & Dial Calibration
Choose **one** dominant direction (*Swiss Editorial*, *Linear Dark Precision*, *Warm Paper Craft*, *Architectural Brutalism*, *Quiet Luxury Serif*, or *Pro Telemetry Workbench*) and lock `DESIGN_VARIANCE`, `MOTION_INTENSITY`, `VISUAL_DENSITY`. For multi-page projects, anchor rules in [resources/design-manifest.template.md](./resources/design-manifest.template.md).

### Phase 2: Typography & OKLCH Tonal System
Configure modular scale, optical negative headline tracking, `tabular-nums`, and tinted OKLCH neutrals using [references/typography-and-oklch-color-systems.md](./references/typography-and-oklch-color-systems.md) and [resources/oklch-craft-tokens.css](./resources/oklch-craft-tokens.css).

### Phase 3: Spatial Composition & Optical Geometry
Eliminate card-within-card bloat. Enforce concentric border radii (`R_outer = R_inner + padding`), optical centering on asymmetric glyphs, `100dvh` full-height shells, `min-width: 0` Flex/Grid overflow protection, `overscroll-behavior: contain` on drawers, and crisp `1px` structural hairlines ([references/spatial-rhythm-and-micro-craft.md](./references/spatial-rhythm-and-micro-craft.md)).

### Phase 4: Tactile Motion Physics & Micro-Craft
Prefer **interruptible** CSS transitions (plus calibrated CSS `linear()` springs or `bounce: 0` springs) over rigid keyframes for interactive popovers, drawers, and active highlights. Use `cubic-bezier(0.22, 1, 0.36, 1)` / `0.32, 0.72, 0, 1`, `scale(0.97)` tactile press feedback, origin-aware scales (`0.9 -> 1`), pooled `IntersectionObserver` / `visibilitychange` loop throttling, and SSR-safe `prefers-reduced-motion` (`true` on server snapshot).

### Phase 5: Frontend Harness Loop (Critique, Distill & Browser Self-Heal)
Execute a closed **Critique -> Capture -> DOM/Console Gate -> Repair** loop ([references/critique-distill-polish-loop.md](./references/critique-distill-polish-loop.md)): inspect accessibility snapshots + desktop (`1440×900`) & mobile (`390×844`) captures, confirm 0 console/hydration/network errors and `scrollWidth <= innerWidth`, then run static checks:
```bash
node skills/engineering/web/frontend/design-taste/examples/design_taste_audit.ts path/to/target.css
```

---

## References, Resources & Examples
- Live Production Benchmark Teardown (`linear.app`, `vercel.com`, `stripe.com`, `raycast.com`): [references/live-benchmark-teardown.md](./references/live-benchmark-teardown.md)
- Aesthetic Directions & Taste Dials: [references/aesthetic-directions-and-dials.md](./references/aesthetic-directions-and-dials.md)
- Typography & Perceptual OKLCH Color: [references/typography-and-oklch-color-systems.md](./references/typography-and-oklch-color-systems.md)
- Spatial Rhythm, Concentricity & Micro-Craft: [references/spatial-rhythm-and-micro-craft.md](./references/spatial-rhythm-and-micro-craft.md)
- Critique, Distill & Polish Protocol: [references/critique-distill-polish-loop.md](./references/critique-distill-polish-loop.md)
- Project `DESIGN.md` Anchor Template: [resources/design-manifest.template.md](./resources/design-manifest.template.md)
- Perceptual OKLCH Craft Tokens: [resources/oklch-craft-tokens.css](./resources/oklch-craft-tokens.css)
- Anti-Slop Rubric & Gate Rules: [resources/anti-slop-gate.json](./resources/anti-slop-gate.json)
- Editorial Asymmetric Split Hero Example: [examples/editorial_split_hero.html](./examples/editorial_split_hero.html)
- Linear Dark Precision Workbench CSS: [examples/linear_precision_workbench.css](./examples/linear_precision_workbench.css)
- Production Interactive Craft Primitives: [examples/interactive_craft_primitives.ts](./examples/interactive_craft_primitives.ts)
- Design Taste Source Auditor: [examples/design_taste_audit.ts](./examples/design_taste_audit.ts)
