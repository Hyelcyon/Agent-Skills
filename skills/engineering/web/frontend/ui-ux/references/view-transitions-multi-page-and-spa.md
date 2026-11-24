# View Transitions API Architecture: SPA and Multi-Page

Engineering specifications for declarative, hardware-accelerated animations using the browser View Transitions API.

---

## 1. Single Page Application (SPA) View Transitions

The View Transitions API captures snapshots of the current DOM, executes the DOM update callback, and animates between snapshots:

```typescript
export function navigateWithTransition(updateDomCallback: () => void | Promise<void>): Promise<void> {
  const doc = document as unknown as {
    startViewTransition?: (cb: () => void | Promise<void>) => {
      finished: Promise<void>;
      ready: Promise<void>;
      updateCallbackDone: Promise<void>;
    };
  };

  if (!doc.startViewTransition) {
    const result = updateDomCallback();
    return result instanceof Promise ? result : Promise.resolve();
  }

  const transition = doc.startViewTransition(async () => {
    await updateDomCallback();
  });

  return transition.finished;
}
```

---

## 2. Multi-Page Application (MPA) Cross-Document Transitions

Enable seamless animated transitions across distinct HTML pages without any JavaScript router:

```css
@view-transition {
  navigation: auto;
}
```

When navigating between two pages that share this CSS rule on the same origin, the browser automatically cross-fades old and new documents.

---

## 3. Morphing Shared Elements: `view-transition-name`

To animate an individual element smoothly from its position on page A to its position on page B:

```css
.product-card-image {
  view-transition-name: product-hero-image;
}
```

The browser pairs identical `view-transition-name` identifiers between states and performs fluid hardware-accelerated size, position, and clipping transforms.

---

## 4. Customizing Transition Animations

Override default cross-fade animations using the pseudo-element tree:

```css
::view-transition-old(root) {
  animation: 250ms ease-out both fade-out;
}

::view-transition-new(root) {
  animation: 250ms ease-in both fade-in;
}

@keyframes fade-out {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.98); }
}

@keyframes fade-in {
  from { opacity: 0; transform: scale(1.02); }
  to { opacity: 1; transform: scale(1); }
}
```

---

## 5. Accessibility Mandate: Respecting Motion Preferences

Always disable view transitions for users who prefer reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none !important;
  }
}
```
