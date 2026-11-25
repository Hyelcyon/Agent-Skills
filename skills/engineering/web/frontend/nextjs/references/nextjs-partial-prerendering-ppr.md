# Next.js 15 Partial Prerendering (PPR)

Engineering specifications for combining static build optimization with dynamic streaming personalization using Partial Prerendering.

---

## 1. What is Partial Prerendering?

Partial Prerendering (PPR) unifies static site generation (SSG) and server-side rendering (SSR) into a single page lifecycle:
- **Static Shell**: Navigation bars, layout headers, and static marketing text are pre-rendered into HTML at build time and served immediately via edge CDN.
- **Dynamic Holes**: Dynamic personalized components (user carts, notifications, real-time counters) are rendered as Suspense fallbacks in the shell, and streamed in asynchronously over the open HTTP connection as their data resolves.

---

## 2. Enabling Partial Prerendering

Enable PPR at the route segment level in `layout.tsx` or `page.tsx`:

```tsx
export const experimental_ppr = true;
```

Or configure globally in `next.config.mjs`:
```javascript
const nextConfig = {
  experimental: {
    ppr: 'incremental'
  }
};

export default nextConfig;
```

---

## 3. Implementing the Static-Dynamic Boundary

Wrap all components that depend on dynamic request data (`cookies()`, `headers()`, or un-cached database queries) inside React `<Suspense>` boundaries:

```tsx
import { Suspense } from 'react';
import { cookies } from 'next/headers';

export const experimental_ppr = true;

async function DynamicUserCart() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_token')?.value;
  if (!sessionToken) return <div>Cart: 0 items</div>;

  const res = await fetch('https://api.enterprise.com/cart', {
    headers: { Authorization: `Bearer ${sessionToken}` },
    cache: 'no-store'
  });
  if (!res.ok) {
    return <div>Cart unavailable</div>;
  }
  const data = (await res.json()) as { itemCount: number };

  return <div>Cart: {data.itemCount} items</div>;
}

export default function StorefrontPage() {
  return (
    <main>
      <header>
        <h1>Store Catalog</h1>
        <p>Instant static header served immediately from CDN edge.</p>
      </header>

      <section>
        <Suspense fallback={<div className="skeleton">Loading cart...</div>}>
          <DynamicUserCart />
        </Suspense>
      </section>
    </main>
  );
}
```

---

## 4. PPR Invariants
- Never place dynamic data calls (`await cookies()`) in the root component body outside a `<Suspense>` boundary; doing so forces the entire page to de-opt into full dynamic rendering, destroying the static shell.
- Keep `<Suspense>` boundaries granular around small dynamic islands rather than wrapping the entire page.
