# Spatial Rhythm, Optical Geometry & Physical Micro-Craft

Subtle geometric misalignment and sluggish linear transitions instantly expose rushed UI. Senior design craft resolves alignment optically and models motion physically.

---

## 1. Concentric Border Radius Geometry

When rounding nested containers (e.g., an outer modal or card containing an inner button, image, or badge), equal radii (`16px` inside `16px`) pinch awkwardly at the corners. Enforce **concentric geometry**:

$$\text{Outer Radius} = \text{Inner Radius} + \text{Padding}$$

```css
.panel-outer {
  --pad: 0.75rem;         /* 12px */
  --radius-inner: 0.5rem; /* 8px */
  padding: var(--pad);
  border-radius: calc(var(--radius-inner) + var(--pad)); /* 20px concentric */
}

.panel-inner {
  border-radius: var(--radius-inner);
}
```
If the inner element sits flush edge-to-edge or is sharp-edged architectural work, keep radii minimal (`2px–6px` or strict `0px` Swiss/Brutalist).

---

## 2. Optical vs Mathematical Alignment

Bounding boxes lie to human eyes. Apply deliberate optical compensation:
- **Directional Icons (Play, Arrow, Triangle)**: A mathematically centered play triangle looks shifted left because its mass sits near the vertical edge. Offset `translateX(1px)` or add asymmetric horizontal padding (`padding-inline: 14px 12px` for leading icon buttons).
- **Pill Buttons with Mixed Icon + Text**: Text optical weight feels pulled toward the text side; give the text side `2px–4px` extra padding compared to the icon side (`padding: 0.5rem 1.125rem 0.5rem 0.875rem`).
- **Caps & Baseline Alignment**: Small eyebrow metadata next to oversized display headlines aligns optically to cap-height or baseline rather than raw box `align-items: center`.
- **Negative Card Bloat Rule**: Instead of wrapping 6 items inside 6 rounded shadow boxes inside an outer rounded card, use a **flush `1px` architectural grid**:
  ```css
  .hairline-grid {
    display: grid;
    gap: 1px;
    background: var(--border-hairline);
    border: 1px solid var(--border-hairline);
  }
  .hairline-grid > * {
    background: var(--surface-canvas);
  }
  ```
- **Directional `135deg` Masked Gradient Borders (Dark Hardware Feel)**: Replace uniform solid dark-mode card borders with a `1px` `::before` pseudo-element using `mask-composite: exclude` so light catches top-left and bottom-right corners while receding softly along mid-edges:
  ```css
  .specular-card {
    position: relative;
    background: oklch(1 0 0 / 0.02);
    border-radius: 1.25rem;
  }
  .specular-card::before {
    content: "";
    position: absolute;
    inset: 0;
    padding: 1px;
    border-radius: inherit;
    background: linear-gradient(135deg, oklch(1 0 0 / 0.14), oklch(1 0 0 / 0.04) 38% 62%, oklch(1 0 0 / 0.14));
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask-composite: exclude;
    pointer-events: none;
  }
  ```
- **Tactile Micro-Bevel CTAs & Keycaps**: High-craft solid light buttons in dark UIs combine a subtle top highlight + bottom edge shadow (`box-shadow: 0 0 0 2px oklch(0 0 0 / 0.5), inset 0 1px 0.4px oklch(1 0 0 / 0.9), inset 0 -1px 0.4px oklch(0 0 0 / 0.25)`). Inside tool previews, frame shortcut hints as compact `20x20px` `6px`-radius keycaps (`11px` mono/sans).
- **Bottom-Fading Product UI Canvases**: Dissolve embedded UI mockups naturally into the background canvas using vertical alpha masking (`mask-image: linear-gradient(to bottom, #000 68%, transparent);`) instead of hard clipped bottom rectangles.

- **Hover & Negative-Bleed Spacing**: On list rows in narrow columns, expand hover hit/background area outward with matching negative margin and padding (`-mx-4 px-4`) so backgrounds breathe around text without breaking column alignment.
- **Line/Edge Vertical Fade**: Mask scrolling edges smoothly using `backdrop-filter: blur(1px)` paired with `mask-image: linear-gradient(to bottom, var(--surface-canvas) 25%, transparent)`.

---

## 3. Physical Motion Curves, `linear()` Springs & JS Craft

UI transitions must be **interruptible** (prefer CSS `transition` over rigid `@keyframes` for toggles, dropdowns, and sheets so rapid user re-clicks retarget smoothly mid-flight):

| Interaction Class | Duration | Curve / Spring | Notes |
| :--- | :--- | :--- | :--- |
| **Hover / Border / Color** | `140ms–200ms` | `cubic-bezier(0.22, 1, 0.36, 1)` | Fast response; avoid `ease-in` on UI entrances |
| **Tactile Button Press** | `90ms–120ms` | `ease-out` -> `transform: scale(0.97)` | Immediate physical detent on `:active` |
| **Origin-Aware Popover / Menu** | `160ms–280ms` | `cubic-bezier(0.19, 1, 0.22, 1)` | Anchor `transform-origin: var(--transform-origin)`, animate `scale(0.92 -> 1)` (never `scale(0)`) |
| **Drawer / Sheet Transition** | `250ms–500ms` | `cubic-bezier(0.32, 0.72, 0, 1)` | Vaul / iOS deceleration; over-drag dampened via `8 * (Math.log(t + 1) - 2)` |
| **Hold-to-Confirm Progress** | `1500ms–2000ms` | `clip-path` `linear` forward, `.2s ease-out` cancel | Exception where constant-rate progress fill uses `linear`; release snaps back fast |
| **CSS-Only Spring (`linear()`)** | `350ms–500ms` | `--spring-1: linear(0, ..., 1.04 40%, 1)` | Calibrated multi-stop CSS spring with ~4% overshoot and zero Framer runtime cost |

### Non-Negotiable Motion & Runtime JS Invariants
- Animate **exclusively** compositor properties (`transform`, `opacity`, `clip-path`, or quick transient `filter: blur(4px) -> blur(0px)` on tiny chips). Never transition `width`, `height`, `top`, or `left`.
- **Keyboard Focus Hygiene**: Suppress distracting click focus rings with `onMouseDown={(e) => e.preventDefault()}` on non-text-input buttons while preserving bold `:focus-visible` (`4px` offset) outlines on `Tab`.
- **Canvas & Video Resource Discipline**: Pool `IntersectionObserver` instances across cards, pause off-viewport `<video>`/tickers, suspend `requestAnimationFrame` on `document.hidden`, and default SSR reduced-motion hooks (`useSyncExternalStore`) to `true` before client hydration. See [examples/interactive_craft_primitives.ts](../examples/interactive_craft_primitives.ts).
- Disable hover transforms on coarse touch pointers (`@media (hover: hover)`), clamp mobile canvas DPR to `Math.min(dpr, 1.5)`, and collapse motion under `@media (prefers-reduced-motion: reduce)`.
