# Aesthetic Directions & Taste Dial Matrix

Never start writing JSX or CSS from an unanchored prompt like "make it clean and modern." Commit to a concrete studio aesthetic direction and dial tuple first.

---

## 1. Signature Aesthetic Archetypes

| Archetype | Ideal Context | Recommended Dials `(Var, Mot, Den)` | Structural Signature | Typographic Voice | Surface & Accent Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Swiss Editorial** | Publications, agencies, AI research labs | `(8, 4, 3)` | `1.35fr / 1fr` asymmetric splits, full-bleed `1px` rule lines, numbered index columns | Serif Display (`Instrument Serif`, `Newsreader`) + Neo-grotesk (`Satoshi`, `Plus Jakarta Sans`) + Mono metadata | Warm bone canvas (`L=0.985`), deep ink (`L=0.17`), 1 vermilion/cobalt editorial accent |
| **Linear Dark Precision** | Developer tools, SaaS apps, IDE/CLI portals | `(4, 6, 7)` | Flush `1px` translucent borders, top specular highlight, zero blurry drop-shadows | Tight grotesk display (`Space Grotesk`, `General Sans`, `-0.03em`) + `JetBrains Mono` `tabular-nums` | Cool obsidian hierarchy (`L=0.11 -> 0.14 -> 0.18`), silver muted labels, single electric accent |
| **Warm Paper Tactile** | Productivity notes, consumer craft, portfolios | `(6, 5, 4)` | Generous `clamp()` breathing room, soft hairline cards, subtle noise/paper grain | Humanist sans + crisp serif headings (`Fraunces` / `Source Serif 4`) | Cream off-white (`hue ~85, C ~0.01`), espresso ink, forest or terracotta accent |
| **Architectural Brutalism** | Design festivals, creative tech, bold brands | `(9, 5, 5)` | Zero border-radius (`0px`), thick `1.5px–2px` grid seams, oversized tight headers | Condensed grotesk (`Syne`, `Oswald`) + raw uppercase mono tags | High-contrast bone + carbon black, single hazard/signal accent |
| **Quiet Luxury Minimal** | Fintech private wealth, hardware, fashion | `(5, 3, 2)` | Vast negative space (40%+ open canvas), single focal artifact per viewport | High-contrast display serif + airy light-weight body (`300–400`) | Sand/stone tinted neutral, muted champagne/bronze hairlines |
| **Pro Telemetry Workbench** | Observability, trading, BI cockpits | `(2, 3, 9)` | Dense synchronized split panes, compact `32px` row rhythm, sticky table headers | Crisp UI sans + `tabular-nums` mono everywhere numeric values align | Neutral slate/charcoal with zero decorative gradients; semantic status colors strictly muted |

---

## 2. Calibrating the 3 Dials Without Breaking Usability

### `DESIGN_VARIANCE` (`1–10`)
- **`1–3`**: Reserve for regulated forms, settings, and multi-panel dashboards where predictability beats surprise.
- **`4–7`**: Introduce asymmetric two-column sections (`7fr / 5fr`), varied bento spans (`col-span-2` paired with `1x1`), and flush index lists instead of 3 uniform cards.
- **`8–10`**: Break viewport symmetry intentionally (offset section numbers in left margin, full-width horizontal hairline dividers, overlapping editorial captions over media)—always collapse cleanly back to a 1-column rhythm below `768px`.

### `MOTION_INTENSITY` (`1–10`)
- **`1–3`**: Instant state transitions (`150ms`), tactile press (`scale(0.97)`), zero entrance choreography. Best for high-frequency data tools where wait animations feel sluggish.
- **`4–7`**: Weighted exponential entrances (`cubic-bezier(0.22, 1, 0.36, 1)`), shared border/tab indicators, crisp `<= 80ms` stagger on <= 5 sibling items.
- **`8–10`**: Reserve for narrative marketing or showcase sites; keep scroll animations `transform`/`opacity`/`clip-path` only so compositor frames stay locked at `60–120fps`.

### `VISUAL_DENSITY` (`1–10`)
- **`1–3`**: Cap content blocks cleanly around `max-width: 1120px–1280px`, generous vertical section cadence (`6rem–9rem`), and `>= 1.65` line height for editorial breath.
- **`4–7`**: Balanced `16px–24px` internal container rhythm with clear section hierarchy (`1rem` gap inside groups, `3rem–4rem` between groups).
- **`8–10`**: Compact `8px–12px` control gaps, `12px–13px` tabular monospace labels, compact toolbars (`36px–40px` height)—preserve `>= 24px` interactive hit targets and scannable contrast.

---

## 3. Escaping the "Centered 3-Card SaaS Hero" Trap

When given a generic prompt like *"Build a landing page for an API observability tool"*, replace predictable symmetry:
- **Instead of** centered badge + centered H1 + centered subtext + 2 centered buttons + 3 identical blurred purple cards:
- **Use** an **asymmetric two-column architectural split**: left rail anchors the editorial H1 (`text-align: left`, optical `-0.03em` tracking), crisp 1-sentence thesis, and single primary CTA + secondary ghost link; right rail renders an authentic live-looking telemetry frame or structured code inspection panel framed by a `1px` hairline border.
- **Below the fold**: Replace floating round cards with a flush **CSS Grid architectural matrix** divided by shared `1px` borders (`background: var(--border-hairline); gap: 1px;`) across unequal `2:1` / `1:1:2` spans.
