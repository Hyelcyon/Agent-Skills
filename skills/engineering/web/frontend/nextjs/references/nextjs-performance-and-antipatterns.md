# Next.js 15 Performance Profiling and Anti-Patterns

A technical guide to Next.js 15 build performance with Turbopack, Core Web Vitals optimization, and the Top 10 architectural anti-patterns.

---

## 1. Turbopack Build Engine Standards

Next.js 15 stabilizes Turbopack for development (`next dev --turbopack`):
- Performs incremental function-level and module-graph compilation, bundling only routes visited during development.
- Keeps Fast Refresh updates scoped to modified modules rather than rebuilding the full Webpack graph.
- Enforce strict import cleanliness (avoid barrel re-exports of large component trees) to maximize incremental compilation efficiency.

---

## 2. Core Web Vitals Optimization Primitives

### Asset Loading via `next/image`
Eliminate Cumulative Layout Shift (CLS) and optimize Largest Contentful Paint (LCP):
```tsx
import Image from 'next/image';

export function ProductHeroBanner() {
  return (
    <div className="relative w-full h-[500px]">
      <Image
        src="/images/hero-banner.webp"
        alt="Featured Product Catalog"
        fill
        priority
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
        className="object-cover"
      />
    </div>
  );
}
```

### Zero-Layout-Shift Fonts via `next/font`
Self-hosts Google and local fonts at build time with zero external network requests:
```tsx
import { Inter } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

// Apply `className={inter.variable}` on `<html>` in `app/layout.tsx`
```

---

## 3. Top 10 Next.js Anti-Patterns

### 1. Synchronous `cookies()` or `headers()` Access
- ❌ **Anti-Pattern**: Treating `cookies()` as synchronous in Next.js 15: `const cookie = cookies().get('token')`.
- ✅ **The Senior Fix**: Always await dynamic request APIs: `const cookieStore = await cookies();`.

### 2. Mutating Cookies During Component Render
- ❌ **Anti-Pattern**: Attempting `cookieStore.set()` inside a Server Component render cycle.
- ✅ **The Senior Fix**: Cookie mutations are permitted strictly inside Server Actions or Route Handlers.

### 3. Declaring `'use client'` on Root Layouts
- ❌ **Anti-Pattern**: Marking `app/layout.tsx` or `app/page.tsx` as `'use client'`, converting the entire downstream subtree into client-rendered JavaScript.
- ✅ **The Senior Fix**: Keep layouts and pages as Server Components; extract interactive widgets into isolated client leaf components.

### 4. Leaking Server Modules to the Client
- ❌ **Anti-Pattern**: Importing database clients or private secrets into files marked `'use client'`.
- ✅ **The Senior Fix**: Use the `server-only` package: `import 'server-only';` in backend utilities to throw build-time errors if imported on the client.

### 5. Missing `<Suspense>` Boundaries in PPR Routes
- ❌ **Anti-Pattern**: Reading dynamic cookies in a PPR page without a `<Suspense>` boundary, de-opting the entire page into dynamic SSR.
- ✅ **The Senior Fix**: Wrap dynamic islands in `<Suspense fallback={<Skeleton />}>`.

### 6. Using Raw `<a>` Tags for Internal Navigation
- ❌ **Anti-Pattern**: Navigating between internal routes using `<a href="/about">`, causing full browser page reloads.
- ✅ **The Senior Fix**: Use `<Link href="/about">` for instant client-side transitions and prefetching.

### 7. Catching Next.js `redirect()` in `try/catch`
- ❌ **Anti-Pattern**: Wrapping `redirect('/dashboard')` in a generic catch block that catches Next.js internal control-flow exceptions.
- ✅ **The Senior Fix**: Call `redirect()` outside `try/catch` blocks.

### 8. Uncached Monolithic Layout Revalidation
- ❌ **Anti-Pattern**: Calling `revalidatePath('/', 'layout')` on every mutation, purging the entire application cache.
- ✅ **The Senior Fix**: Use targeted path revalidation (`revalidatePath('/dashboard')`) or tag revalidation (`revalidateTag('user_orders')`).

### 9. Passing Sensitive Database Rows to Client Props
- ❌ **Anti-Pattern**: Passing entire database user records (including hashed passwords and internal flags) to Client Components.
- ✅ **The Senior Fix**: Map and prune objects to public DTO interfaces before passing across serialization boundaries.

### 10. Manual API Fetching in Server Components
- ❌ **Anti-Pattern**: Calling internal `/api/...` Route Handlers via `fetch()` from Server Components on the same server.
- ✅ **The Senior Fix**: Call database functions or domain services directly inside Server Components without HTTP hop overhead.
