# Next.js 15 App Router and Server Components Architecture

Engineering specifications for Next.js 15 App Router directory conventions, React Server Components (RSC), and composition boundaries.

---

## 1. App Router Directory Structure

The Next.js App Router organizes full-stack applications using nested folders inside `app/`:

- `layout.tsx`: Persistent UI shared across routes in a segment. Does not re-render on navigation.
- `page.tsx`: Unique UI of a route, making the route publicly accessible.
- `loading.tsx`: Instant loading skeleton wrapped in a React `<Suspense>` boundary.
- `error.tsx`: Runtime error boundary isolating failures to the current route segment.
- `not-found.tsx`: 404 UI rendered when `notFound()` is invoked.

---

## 2. Server Components by Default

In the App Router, all components inside `app/` are React Server Components (RSC) by default:
- Execute strictly on the server: Zero JavaScript bundle impact on the client.
- Direct backend access: Can directly query databases, read server filesystem, and call internal microservices.
- No client-side React hooks: `useState`, `useEffect`, and event handlers (`onClick`) are forbidden in Server Components.

---

## 3. Client Component Boundary: `'use client'`

Place the `'use client'` directive at the top of a file only when client-side interactivity is required:

```tsx
'use client';

import { useState } from 'react';

export function InteractiveCounter() {
  const [count, setCount] = useState(0);

  return (
    <button type="button" onClick={() => setCount((c) => c + 1)}>
      Count: {count}
    </button>
  );
}
```

---

## 4. Composition Pattern: Passing Server Components to Client Parents

Client Components cannot directly import Server Components, but can receive them as `children` or JSX slots:

```tsx
'use client';

import { useState } from 'react';

export function CollapsibleSection({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section>
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        Toggle
      </button>
      {isOpen && children}
    </section>
  );
}
```

Usage in a Server Component `page.tsx`:
```tsx
import { CollapsibleSection } from './CollapsibleSection';
import { HeavyServerDataList } from './HeavyServerDataList';

export default function DashboardPage() {
  return (
    <CollapsibleSection>
      <HeavyServerDataList />
    </CollapsibleSection>
  );
}
```
