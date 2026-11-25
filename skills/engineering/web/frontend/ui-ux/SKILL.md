---
name: ui-ux
description: Use when building responsive modern web UI components, applying advanced CSS (:has, @container, subgrid), enforcing WCAG 2.2 AA accessibility standards, or integrating the View Transitions API.
---

# Enterprise Frontend UI/UX & Modern CSS Architecture

Engineering standards for building accessible, high-performance web user interfaces using modern CSS primitives (`:has()`, container queries, subgrid), the View Transitions API, and WCAG 2.2 AA standards.

## When to Use
- Writing responsive component styles using CSS Container Queries (`@container`) and `:has()`.
- Enforcing WCAG 2.2 AA accessibility guidelines (focus management, touch targets, ARIA roles).
- Smoothly animating view or page state changes via the View Transitions API.
- Structuring design token palettes across light and dark modes with `light-dark()`.
- Integrating memorable animated components, text effects, or 3D backgrounds (use companion skill `react-bits`).
- Establishing senior art direction, anti-AI-slop typography, OKLCH palette restraint, or aesthetic critique/redesign (pair with `design-taste`).

## When NOT to Use
- Pure art direction, layout taste calibration, or visual critique without accessibility/CSS plumbing focus (start with `design-taste`).
- Writing backend rendering or database querying logic (use `api` or `architecture`).
- Managing complex asynchronous server cache invalidations (use `state-management`).

---

## 5-Phase Agent Operational Protocol

```
Phase 1: Component Anatomy & Interaction State Profiling
Phase 2: Accessible Semantics & Focus Flow Formulation (WCAG 2.2 AA)
Phase 3: Responsive Container & Token Orchestration (@container, light-dark())
Phase 4: Fluid Motion & Transitions Execution (View Transitions API, reduced-motion)
Phase 5: Cross-Browser & Accessibility Verification (axe-core, keyboard trap test)
```

### Phase 1: Component Anatomy Profiling
Identify interactive states (hover, active, focused, disabled, invalid). Map required touch targets (minimum $24 \times 24\text{px}$ for Level AA per WCAG 2.2 SC 2.5.8, with $44 \times 44\text{px}$ recommended for Level AAA).

### Phase 2: Accessible Semantics & Focus Flow
Enforce keyboard navigation and focus containment. Traps in modals must restore focus to the opening element upon close. Ensure screen reader announcements via `aria-live` or native `<dialog>`.

### Phase 3: Responsive Container, Baseline Hygiene & Token Orchestration
Build components with CSS Container Queries (`@container`) so widgets adapt within arbitrary parent layouts. Use `100dvh` instead of `100vh`, `min-width: 0` inside Flex/Grid cells to prevent string overflow, `overscroll-behavior: contain` on scrollable drawers, `touch-action: manipulation` on interactive controls, URL search-param syncing for tabs/filters, and semantic Top Layer (`<dialog>`, `popover`) instead of arbitrary `z-[9999]`. Structure theme colors via `light-dark()` tokens:
```css
.card {
  color: light-dark(#111827, #f9fafb);
  background: light-dark(#ffffff, #1f2937);
}
```

### Phase 4: Fluid Motion & View Transitions
Wrap page and DOM updates in `document.startViewTransition()`. Provide fallback animations for browsers without support and respect `prefers-reduced-motion`. For interactive animated UI cards, text effects, and backgrounds, dispatch `react-bits`.

### Phase 5: Visual Agent Feedback Loop & Accessibility Proof
Run a closed browser loop against the preview server (Accessibility Tree snapshot -> `1440×900` / `390×844` viewport check -> Console/Hydration/4xx-5xx error interception -> Repair) paired with user-centric Playwright assertions (`getByRole`, `getByLabel`, `Tab`/`Escape` focus restoration with click-focus suppression via `onMouseDown`, and `scrollWidth <= innerWidth` — never brittle CSS selectors or `waitForTimeout`) and `axe-core`:
```bash
npx @axe-core/cli http://localhost:3000
```

---

## Prohibited Anti-Patterns

- ❌ Trapping keyboard focus without an `Escape` key dismiss handler.
- ❌ Removing focus rings with `outline: none` without providing an accessible alternative.
- ❌ Building custom modal dialogs with `div` instead of native `<dialog>`.
- ❌ Using `100vh` for full-height shells, omitting `min-width: 0` on Grid/Flex text cells, or fighting layering with arbitrary `z-[9999]`.
- ❌ Writing brittle Playwright tests targeting internal CSS classes or `waitForTimeout()` sleeps instead of ARIA roles and Web-First assertions.
- ❌ Relying exclusively on color to convey information or validation status.
- ❌ Running animations that violate user `prefers-reduced-motion` settings.

---

## References & Documentation
- Modern CSS & WCAG 2.2: [references/modern-css-and-accessibility.md](./references/modern-css-and-accessibility.md)
- Native Dialog, Popover & Anchor Positioning: [references/native-dialog-and-popover-api.md](./references/native-dialog-and-popover-api.md)
- View Transitions Architecture: [references/view-transitions-multi-page-and-spa.md](./references/view-transitions-multi-page-and-spa.md)
- Senior Design Taste & Craft: [../design-taste/SKILL.md](../design-taste/SKILL.md)
- React Bits Design System: [../react-bits/SKILL.md](../react-bits/SKILL.md)

## Resources & Examples
- Design Tokens Starter: [resources/design-tokens.json](./resources/design-tokens.json)
- Modern CSS Reset & Fluid Tokens: [resources/reset-and-tokens.css](./resources/reset-and-tokens.css)
- WCAG 2.2 AA Audit Checklist: [resources/wcag-audit-checklist.json](./resources/wcag-audit-checklist.json)
- Accessible Modal Focus Trap: [examples/accessible_modal_dialog.ts](./examples/accessible_modal_dialog.ts)
- View Transition Helper: [examples/view_transition_helper.ts](./examples/view_transition_helper.ts)
- Popover & Anchor Menu Helper: [examples/popover_anchor_menu.ts](./examples/popover_anchor_menu.ts)
