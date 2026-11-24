# Modern CSS Cascade Layers, Scope, and Nesting Architecture

Architectural standards for controlling cascade priority, scoping component styles without CSS Modules/BEM naming conventions, and utilizing native CSS Nesting.

## 1. Controlling Cascade Specificity with @layer

Cascade Layers (`@layer`) allow developers to control CSS precedence explicitly regardless of selector specificity or source order.

### Declaring Layer Order

Always declare the canonical layer sequence at the top of the root stylesheet:

```css
@layer reset, base, design-system, components, utilities;

@layer reset {
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
}

@layer components {
  .btn-primary {
    background-color: var(--color-brand-primary);
    color: var(--color-brand-contrast);
    padding: 0.75rem 1.5rem;
    border-radius: var(--radius-md);
  }
}

@layer utilities {
  .hidden {
    display: none !important;
  }
}
```

Styles defined in later layers override earlier layers. Unlayered styles always take precedence over layered styles. Within a single layer, normal specificity rules apply.

---

## 2. Component Encapsulation with @scope

CSS `@scope` enables style boundary scoping directly in native CSS, preventing rules from leaking into child subtrees without relying on shadow DOM or build-step class hashing.

### Basic Scoping Boundary

```css
@scope (.media-card) {
  :scope {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
    border: 1px solid var(--border-subtle);
  }

  .title {
    font-size: 1.25rem;
    font-weight: 600;
  }

  .description {
    color: var(--text-muted);
  }
}
```

The selector `.title` matches only elements with class `title` that are inside `.media-card`.

### Doughnut Scoping (Scoping with Limits)

Doughnut scoping isolates a parent container while explicitly preventing styles from applying to nested components:

```css
@scope (.article-body) to (.code-block, .embed-widget) {
  p {
    line-height: 1.75;
    margin-block-end: 1.25rem;
  }

  a {
    color: var(--color-interactive-link);
    text-decoration: underline;
  }
}
```

Paragraphs and links inside `.code-block` or `.embed-widget` remain unaffected by the article's typography styles.

---

## 3. Native CSS Nesting Standards

Modern CSS supports native nesting without preprocessors.

```css
.card {
  background-color: var(--surface-primary);
  border-radius: var(--radius-lg);
  padding: 1.5rem;

  &:hover {
    box-shadow: var(--shadow-md);
  }

  & > .header {
    margin-block-end: 1rem;
  }

  @media (min-width: 768px) {
    padding: 2.5rem;
  }
}
```

- Always use the nesting selector `&` when referencing pseudoclasses or compound selectors.
- Limit nesting to a maximum depth of 3 levels to maintain readability and avoid excessive selector specificity.
