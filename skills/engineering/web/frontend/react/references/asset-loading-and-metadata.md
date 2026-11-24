# React 19 Architecture: Asset Loading & Document Metadata Hoisting

A definitive reference for native document metadata hoisting, stylesheet precedence, resource preloading APIs, and asynchronous asset orchestration in React 19.

---

## 1. Native Document Metadata Hoisting

Historically, managing `<title>`, `<meta>`, and `<link>` tags required third-party libraries like `react-helmet-async`.
React 19 natively supports rendering metadata tags directly inside component render trees:

```tsx
export function BlogPost({ post }: { post: Post }) {
  return (
    <article>
      <title>{post.title} | Engineering Blog</title>
      <meta name="description" content={post.excerpt} />
      <meta name="author" content={post.authorName} />
      <link rel="canonical" href={`https://example.com/blog/${post.slug}`} />

      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

### Automatic Hoisting to `<head>`
React automatically lifts `<title>`, `<meta>`, and `<link>` tags out of the body and mounts them into the document `<head>`, ensuring search engine crawlers and browser tabs receive accurate metadata without external wrapper overhead.

---

## 2. Resource Preloading APIs (`react-dom`)

React 19 provides imperative and declarative functions to instruct the browser to initiate network requests before an asset is needed:

```typescript
import { preload, preinit, prefetchDNS } from 'react-dom';

export function prepareCheckoutPage() {
  prefetchDNS('https://checkout.stripe.com');
  preload('/fonts/inter.woff2', { as: 'font', type: 'font/woff2' });
  preinit('https://analytics.example.com/tracker.js', { as: 'script' });
}
```

---

## 3. Stylesheet Precedence & Non-Blocking Rendering

React 19 coordinates stylesheets using the `precedence` attribute on `<link rel="stylesheet">`:

```tsx
function DesignSystemComponent() {
  return (
    <div>
      <link rel="stylesheet" href="/styles/reset.css" precedence="reset" />
      <link rel="stylesheet" href="/styles/components.css" precedence="high" />
      <div className="card">Content styled with guaranteed precedence</div>
    </div>
  );
}
```
React ensures styles with lower precedence (e.g. `reset`) are injected into the DOM before styles with higher precedence, preventing specificity and load-order cascades (FOUC).
