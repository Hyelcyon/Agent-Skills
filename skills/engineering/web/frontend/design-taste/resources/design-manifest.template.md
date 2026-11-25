# DESIGN.md — Project Visual Direction & Taste Contract

Pin this file at the repository root so every human engineer and AI agent builds from one cohesive aesthetic thesis instead of generic template defaults.

---

## 1. Aesthetic Thesis & Taste Dials
- **Primary Direction**: `[Swiss Editorial | Linear Dark Precision | Warm Paper Craft | Architectural Brutalism | Quiet Luxury | Pro Workbench]`
- **Product Personality**: `[3 concrete adjectives, e.g., Precise, Architectural, Unhurried]`
- **Taste Dials (`1–10`)**:
  - `DESIGN_VARIANCE`: `[1–10]` — `[e.g., 7: Asymmetric 7fr/5fr hero split + hairline bento matrix]`
  - `MOTION_INTENSITY`: `[1–10]` — `[e.g., 4: Fast 160ms exponential hover + tactile scale(0.97) press]`
  - `VISUAL_DENSITY`: `[1–10]` — `[e.g., 5: Calm spacing with compact tabular telemetry rows]`

---

## 2. Typography Stack & Scale Contract
- **Display Font**: `"[Custom Serif / Expressive Grotesk]"`, optical tracking `-0.03em`, `line-height: 1.05`, `text-wrap: balance`
- **Body Font**: `"[Humanist / Neo-Grotesk Sans]"`, prose max measure `68ch`, `line-height: 1.6`, `text-wrap: pretty`
- **Monospace / Data Font**: `"[JetBrains Mono / Geist Mono]"`, always paired with `font-variant-numeric: tabular-nums`
- **Explicitly Banned Fonts**: Unstyled solo `Inter` defaults without intentional scale/pairing discipline

---

## 3. Perceptual OKLCH Surface & Accent Architecture
| Token Role | Light Mode (`oklch`) | Dark Mode (`oklch`) | Intent |
| :--- | :--- | :--- | :--- |
| `surface-canvas` | `oklch(0.985 0.005 85)` | `oklch(0.125 0.008 255)` | Warm bone / cool obsidian base canvas |
| `surface-elevated` | `oklch(0.996 0.002 85)` | `oklch(0.165 0.010 255)` | Elevated sheet (lightness step, not blurry shadow) |
| `border-hairline` | `oklch(0.22 0.01 255 / 0.11)` | `oklch(0.98 0.004 255 / 0.09)` | Crisp `1px` architectural divider |
| `ink-primary` | `oklch(0.18 0.012 255)` | `oklch(0.95 0.004 255)` | High-contrast body & heading ink |
| `ink-muted` | `oklch(0.46 0.012 255)` | `oklch(0.68 0.010 255)` | Secondary labels & metadata |
| `accent-primary` | `[Single Brand OKLCH Color]` | `[Tuned Dark-Safe OKLCH Accent]` | Focal CTA & active indicators (`<= 10%` viewport area) |

---

## 4. Geometry, Motion & Prohibited Slop
- **Concentric Radius Invariant**: `outerRadius = innerRadius + padding` (`--radius-outer: calc(var(--radius-inner) + var(--space-pad))`).
- **Motion Signature**: `cubic-bezier(0.22, 1, 0.36, 1)` (`160ms–220ms`), GPU properties only (`transform`, `opacity`, `clip-path`), reduced-motion parity.
- **Explicit Bans**: Zero purple/indigo neon gradients, zero nested shadow-cards inside shadow-cards, zero pulsing status dots on static labels, zero `"Elevate/Unleash/Seamless"` marketing clichés.
