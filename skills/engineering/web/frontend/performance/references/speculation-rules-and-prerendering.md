# Speculation Rules API and Instant Prerendering

Engineering standards for next-generation instant page transitions using the browser Speculation Rules API.

---

## 1. Overview of Speculation Rules

The Speculation Rules API replaces legacy `<link rel="prefetch">` and `<link rel="prerender">` with structured, performant, and declarative JSON-based rules.
- **Prefetch**: Downloads HTML document responses in the background without executing scripts or allocating rendering engines.
- **Prerender**: Fully renders the target document in an invisible background tab/session, enabling instantaneous 0 ms navigation upon user click.

---

## 2. Declarative Rule Configuration

Place speculation rules inside a `<script type="speculationrules">` element:

```html
<script type="speculationrules">
{
  "prerender": [
    {
      "source": "list",
      "urls": ["/products/featured", "/cart"],
      "eagerness": "moderate"
    }
  ],
  "prefetch": [
    {
      "source": "document",
      "where": {
        "and": [
          { "href_matches": "/blog/*" },
          { "not": { "href_matches": "/blog/archive/*" } },
          { "not": { "selector_matches": ".no-prefetch" } }
        ]
      },
      "eagerness": "conservative"
    }
  ]
}
</script>
```

---

## 3. Eagerness Levels and Resource Scheduling

The `eagerness` property controls when the browser initiates background actions:
- `immediate`: Initiated as soon as the speculation rule is parsed by the DOM engine.
- `eager`: Initiated on slight user hints (e.g., hovering over page elements or scroll momentum).
- `moderate`: Initiated when pointer hovers over matching links for $\ge 200\text{ms}$ or on `pointerdown`. Recommended default for prerendering high-probability targets.
- `conservative`: Initiated strictly on `pointerdown` or touchstart, eliminating speculative network waste while saving 100-300 ms before `click`.

---

## 4. Imperative Insertion via JavaScript

For single-page applications or dynamic routing, insert speculation rules dynamically:

```typescript
export function registerDynamicPrerender(targetUrl: string): void {
  if (HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules')) {
    const specScript = document.createElement('script');
    specScript.type = 'speculationrules';
    specScript.textContent = JSON.stringify({
      prerender: [
        {
          source: 'list',
          urls: [targetUrl],
          eagerness: 'immediate'
        }
      ]
    });
    document.head.appendChild(specScript);
  }
}
```

---

## 5. Prerendering Safety Restrictions
- Never prerender endpoints that trigger mutations, purchases, logouts, or state changes.
- Pages being prerendered have `document.prerendering === true`. Defer non-critical analytics or audio playback until `prerenderingchange` fires.
