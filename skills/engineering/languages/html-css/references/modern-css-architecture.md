# Modern CSS Architecture & Anti-Spaghetti Playbook

Detailed reference for CSS design tokens, BEM-flat architecture, subgrid, and eliminating specificity wars.

---

## 1. CSS Custom Property Design Token System

```css
:root {
  --color-primary-500: oklch(0.6 0.2 250);
  --color-primary-600: oklch(0.48 0.22 250);
  --color-neutral-100: oklch(0.98 0.01 250);
  --color-neutral-900: oklch(0.15 0.02 250);

  --space-2xs: 0.25rem;
  --space-xs: 0.5rem;
  --space-md: 1rem;
  --space-xl: 2rem;

  --radius-md: 0.375rem;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}
```

---

## 2. Preventing Specificity Wars (CSS Cascade Layers)

Control priority cleanly without using `!important`:

```css
@layer reset, tokens, components, utilities;

@layer reset {
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
  }
}

@layer components {
  .btn {
    padding: var(--space-xs) var(--space-md);
    border-radius: var(--radius-md);
    background: var(--color-primary-600);
    color: white;
  }
}

@layer utilities {
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }
}
```

---

## 3. Subgrid Card Alignment (Perfect Column Harmony)

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-md);
}

.card {
  display: grid;
  grid-template-rows: subgrid;
  grid-row: span 3;
}
```
