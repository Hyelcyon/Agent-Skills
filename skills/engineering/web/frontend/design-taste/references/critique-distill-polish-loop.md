# Critique, Distill & Polish Review Loop

Great design taste rarely emerges on the first pass—it comes from disciplined subtraction and surgical optical tuning before delivery. Never mark a frontend UI finished without running this 4-step loop.

---

## 1. Step 1: Critique (Honest 6-Axis Audit)

Score the current implementation ruthlessly (`1–5` per axis). Any score `< 4` blocks delivery until fixed:

1. **Silhouette & Distinction**: If you blurred the brand logo, would this page look identical to every SaaS template? Look for centered-hero + 3-card cliché, unmotivated purple gradients, or stock badge pills.
2. **Typographic Tension**: Is there sharp scale, weight, and measure contrast (`>= 1.25` step ratio, tight display tracking `-0.025em`, `<= 72ch` prose width, `tabular-nums` for metrics)?
3. **Surface & Border Restraint**: Are there nested cards inside cards or heavy gray drop-shadows that can collapse into stepped OKLCH lightness + `1px` hairlines?
4. **Optical & Concentric Precision**: Do nested radii obey `outer = inner + pad`? Are icon buttons, small caps, and table columns optically balanced?
5. **Tactile Motion Discipline**: Do interactive elements have crisp press feedback (`scale(0.97)`), sub-250ms exponential curves, and zero `linear` UI easing?
6. **Copy Authenticity**: Strip hollow buzzwords (`"Unleash"`, `"Revolutionize"`, `"Seamless"`, `"Supercharge"`), decorative pulsing status dots without real telemetry, and repetitive em-dashes (`—`).

---

## 2. Step 2: Distill (Subtract Before Adding)

When a layout looks amateur or noisy, the fix is almost always **removal**, not adding another border, glow, or gradient:
- Remove outer card wrappers when typography and whitespace already establish grouping.
- Delete redundant eyebrow pills (`✨ AI-Powered Feature`) stacked over every headline—use clean monospaced indices (`01 /`, `02 /`) or plain text labels.
- Replace 4-stop saturated gradients with 1 calm background tint + 1 crisp divider line.

---

## 3. Step 3: Polish (High-Leverage Micro-Fixes)

- **Hover State Coherence**: Darken/brighten surface by a subtle tonal step and lift border alpha (`0.08 -> 0.18`) instead of jarring scale jumps on big containers.
- **Image / Media Framing**: Give screenshots, diagrams, and charts intentional framing (`1px` subtle inner border `oklch(... / 0.12)` + concentric radius) so edges never bleed ambiguously into the background.
- **Line-Ending & Overflow Discipline**: Check `min-width: 0` on Grid/Flex children so long mono tokens or code blocks never blow out mobile viewports.

---

## 4. Step 4: Mechanical Gate & Live Inspection

1. Run the static anti-slop heuristic audit on authored stylesheets/templates:
   ```bash
   node skills/engineering/web/frontend/design-taste/examples/design_taste_audit.ts <file.css|html|tsx>
   ```
2. When a preview server is running (e.g. via Playwright, Chrome DevTools, or the `browser` subagent), assert user-centric accessibility and layout integrity across **`1440x900` desktop** and **`390x844` mobile** in **light and dark** color schemes:
   - `document.documentElement.scrollWidth <= window.innerWidth` (zero horizontal overflow)
   - `await document.fonts.ready` (intended typography loaded cleanly)
   - Zero uncaught `console.error` / 5xx asset failures
   - Keyboard navigation via Playwright `getByRole` / `Tab` / `Escape` without `waitForTimeout` sleeps or brittle CSS class selectors
