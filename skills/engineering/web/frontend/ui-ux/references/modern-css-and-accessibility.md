# Modern CSS & WCAG 2.2 AA Accessibility Runbook

A senior frontend manual for modern CSS primitives (`:has()`, `@container`, subgrid, `light-dark()`), View Transitions, and WCAG 2.2 AA accessibility compliance.

---

## 1. Modern CSS Layout Primitives

### Relational Pseudo-Class `:has()`
Enables parent and sibling selection based on descendants, eliminating JavaScript layout wrappers:

```css
article:has(figure) {
  grid-template-columns: 2fr 1fr;
}

form:has(:user-invalid) button[type="submit"] {
  opacity: 0.6;
  cursor: not-allowed;
}
```

### CSS Container Queries (`@container`)
Styles components based on their direct container's dimensions rather than the global viewport:

```css
.card-container {
  container-type: inline-size;
}

@container (min-width: 480px) {
  .card {
    display: grid;
    grid-template-columns: 120px 1fr;
  }
}
```

---

## 2. View Transitions API

Enables animated DOM transitions across view or route changes without complex animation libraries:

```typescript
function transitionView(domUpdate: () => void): void {
  if (typeof document.startViewTransition === 'function') {
    document.startViewTransition(domUpdate);
  } else {
    domUpdate();
  }
}
```

---

## 3. WCAG 2.2 AA Compliance Standards

### Key Success Criteria
1. **Target Size (Minimum) (Criterion 2.5.8 - Level AA)**:
   - Interactive touch targets must measure at least $24 \times 24\text{px}$, or provide sufficient bounding padding.
2. **Focus Not Obscured (Criterion 2.4.11 - Level AA)**:
   - When a component receives keyboard focus, it must not be hidden beneath sticky headers, floating footers, or modals.
3. **Focus Appearance (Criterion 2.4.13 - Level AAA / Recommended AA)**:
   - Visible focus indicator with a minimum contrast ratio of 3:1 against surrounding background colors.
4. **Accessible Modal Dialogs**:
   - Trap keyboard focus within modal bounds while open.
   - Close modal upon pressing `Escape`.
   - Restore keyboard focus to the triggering element upon closure.
