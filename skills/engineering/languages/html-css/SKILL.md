---
name: html-css
description: Use when authoring modern HTML5 semantic markup, CSS architecture (CSS Grid, Flexbox, Container Queries, :has selector), responsive layouts, web accessibility (WCAG), or design token styling.
---

# Modern HTML & CSS Senior Engineering

Production standards for semantic HTML5, modern CSS layouts without JavaScript polyfills, container queries, parent selectors (`:has()`), and accessible interface design.

## When to Use
- Writing semantic HTML5 structures (`main`, `article`, `section`, `nav`, `dialog`).
- Implementing responsive layouts using CSS Grid, Flexbox, and CSS Container Queries (`@container`).
- Modern conditional styling using the `:has()` parent selector and modern pseudo-classes.
- Enforcing web accessibility (WCAG AA/AAA: ARIA attributes, keyboard focus states).
- Managing design tokens with CSS custom properties (variables).

## When NOT to Use
- State management or component logic in JavaScript/TypeScript (use `typescript`).
- Writing low-level backend or native systems code.

---

## 5-Phase Agent Operational Protocol

```
Phase 1: Semantic DOM & Document Outline Profiling
Phase 2: Accessibility Tree & ARIA Invariant Definition (WCAG AA/AAA)
Phase 3: Native Layout Orchestration (CSS Grid, Flexbox, Container Queries)
Phase 4: State & Relational Styling (:has(), :focus-visible, prefers-reduced-motion)
Phase 5: Automated A11y & Visual Viewport Verification (Lighthouse, axe-core)
```

### Phase 1: Semantic DOM Profiling
Structure content with native semantic HTML5 landmark tags (`main`, `header`, `nav`, `article`, `section`, `dialog`). Never use `div` for interactive controls.

### Phase 2: Accessibility Tree & Invariant Definition
Verify keyboard navigable focus tab sequences. Provide meaningful accessible names via `aria-label` or `aria-labelledby` where headings are implicit. Ensure color contrast ratios satisfy WCAG 2.2 AA (4.5:1 text, 3:1 UI components).

### Phase 3: Native Layout Orchestration
Implement fluid layouts using CSS Grid and Flexbox. Use `@container` queries for component-level responsiveness independent of global viewport dimensions:
```css
.card-wrapper {
  container-type: inline-size;
}
@container (min-width: 480px) {
  .card {
    grid-template-columns: 120px 1fr;
  }
}
```

### Phase 4: State & Relational Styling
Leverage relational selectors (`:has()`) and native state pseudo-classes (`:focus-visible`, `:checked`, `:popover-open`). Provide reduced motion fallbacks via `@media (prefers-reduced-motion: reduce)`.

### Phase 5: Verification & Accessibility Proof
Audit markup against a running test fixture with automated accessibility testing engines (never run a blocking dev server synchronously):
```bash
npx @axe-core/cli http://localhost:3000
```

---

## Prohibited Anti-Patterns

- ❌ Using non-semantic elements for interactive triggers (`<div onclick="...">` instead of `<button>`).
- ❌ Removing focus outlines with `outline: none` without providing an accessible alternative.
- ❌ Using hardcoded pixel values (`px`) for responsive font sizes (use `rem` and fluid clamp).
- ❌ Relying on JavaScript for layout calculations where CSS Grid/Container Queries handle it natively.
- ❌ Missing `alt` attributes on non-decorative images.

---

## References & Documentation
- Modern CSS Architecture Runbook: [references/modern-css-architecture.md](./references/modern-css-architecture.md)
- Cascade Layers & Scope: [references/css-cascade-layers-and-scope.md](./references/css-cascade-layers-and-scope.md)
- Advanced Responsive & Fluid Design: [references/advanced-responsive-and-fluid-design.md](./references/advanced-responsive-and-fluid-design.md)

## Resources & Examples
- CSS Tokens & Layers Starter: [resources/tokens.layers.css](./resources/tokens.layers.css)
- Modern CSS Reset: [resources/modern-reset.css](./resources/modern-reset.css)
- Fluid Typography Scales: [resources/fluid-typography.css](./resources/fluid-typography.css)
- Accessible Card Example: [examples/accessible_card.html](./examples/accessible_card.html)
- Container Query Grid Example: [examples/container_query_grid.html](./examples/container_query_grid.html)
- Native Dialog & Popover Example: [examples/dialog_popover_native.html](./examples/dialog_popover_native.html)
