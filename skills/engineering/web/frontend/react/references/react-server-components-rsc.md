# React 19 Architecture: React Server Components (RSC) & Streaming

A senior engineering guide to React Server Components (RSC), the client boundary protocol, serialization boundaries, and streaming SSR.

---

## 1. The Dual-Component Model

React Server Components divide the rendering graph into two distinct environments:

### Server Components (Default)
- Execute exclusively on the server (during build time or on each incoming request).
- Possess direct zero-latency access to backend databases, filesystem, and internal services.
- Never download their JavaScript source or dependencies to the browser.
- Cannot use browser state hooks (`useState`, `useReducer`), effects (`useEffect`), or DOM event listeners.

### Client Components (`'use client'`)
- Execute on the server for initial HTML generation, then hydrate in the browser.
- Include JavaScript in the client bundle.
- Used for interactive controls (buttons, inputs, local animations, browser APIs).

---

## 2. The Boundary & Composition Rule

### The Parent-Child Composition Pattern
A common misconception is that a Server Component cannot be placed inside a Client Component. While a Client Component cannot directly `import` a Server Component, it CAN accept a Server Component passed as `children` or as a JSX prop:

```tsx
export function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {isOpen && children}
    </div>
  );
}

export default async function Page() {
  const data = await db.query('SELECT * FROM metrics');
  return (
    <ClientWrapper>
      <ServerRenderedChart data={data} />
    </ClientWrapper>
  );
}
```

In this pattern, `ServerRenderedChart` renders completely on the server and transmits zero JavaScript to the client.

---

## 3. Serialization Across the Boundary

Data passed from Server Components to Client Components via props must be serializable across the network protocol:
- **Allowed**: Strings, numbers, booleans, plain objects, arrays, Dates, Map, Set, Promises, and Server Actions.
- **Forbidden**: Functions (unless marked with `'use server'`), class instances with custom prototype methods, non-standard symbols.

---

## 4. Streaming Suspense & Progressive Hydration

Wrap asynchronous Server Components in `<Suspense>` boundaries to stream HTML to the browser as individual database queries resolve:

```tsx
export default function Dashboard() {
  return (
    <main>
      <h1>Enterprise Metrics</h1>
      <Suspense fallback={<MetricsSkeleton />}>
        <AsyncMetricsFeed />
      </Suspense>
    </main>
  );
}
```
The browser receives the initial shell immediately, and React progressively replaces the skeleton as `AsyncMetricsFeed` finishes executing on the server.
