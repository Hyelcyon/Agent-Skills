---
name: nextjs
description: Use when building, refactoring, or optimizing Next.js 15+ full-stack web applications, implementing Async Request APIs (cookies, headers, params), configuring Partial Prerendering (PPR), or orchestrating Server Actions.
---

# Enterprise Next.js 15 Architecture & Agent Operational Runbook

Senior engineering standards for modern Next.js 15+ full-stack applications: App Router architecture, React Server Components (RSC), asynchronous Request APIs (`await cookies()`, `await params`), Partial Prerendering (PPR), Server Actions, and Turbopack optimization.

## When to Use
- Building or refactoring Next.js full-stack applications on Next.js 15+ with React 19.
- Handling asynchronous request APIs (`cookies()`, `headers()`, `params`, `searchParams`).
- Enabling Partial Prerendering (PPR) with static shells and Suspense-streamed dynamic islands.
- Mutating data via Server Actions (`'use server'`) with `revalidatePath` and `revalidateTag`.
- Authoring backend Route Handlers (`route.ts`) and global routing `middleware.ts`.
- Optimizing Core Web Vitals via `next/image`, `next/font`, and Turbopack.

## When NOT to Use
- Developing backend-only Node.js microservices with no React component dependencies (use `nodejs`).
- Building pure Single Page Applications with Vite and Vue or Svelte (use `vue` or `svelte`).

---

## 1. Autonomous Agent Operational Protocol

When engineering Next.js applications, the agent must execute these 5 sequential phases:

```
[Phase 1: Segment Audit] ──> [Phase 2: RSC Boundary Mapping] ──> [Phase 3: Async API Resolution] ──> [Phase 4: Action Mutation] ──> [Phase 5: PPR & Verification]
   Audit layout/page tree       Enforce Server Components          Await cookies() & params           Execute 'use server' actions       Verify static shell & build
```

### Phase 1: App Router Segment Audit
1. Organize routes within nested folder segments inside `app/`.
2. Keep `layout.tsx` stateless and persistent across child navigations.

### Phase 2: Server-First Boundary Enforcement
1. Keep all components as React Server Components (RSC) by default.
2. Add `'use client'` only to leaf components requiring DOM interactivity (`useState`, event listeners).
3. Pass Server Components as `children` into Client Component containers to preserve server execution.

### Phase 3: Asynchronous Request & Parallel Data Resolution
1. Always `await cookies()` and `await headers()` in Server Components; in `page.tsx`, treat `params` and `searchParams` as Promises and `await` them (or `use(params)` in Client Components).
2. Parallelize independent fetches with `Promise.all()` or stream slow panels inside distinct `<Suspense>` boundaries (`next/dynamic` for heavy client-only widgets), and deduplicate shared server lookups with `React.cache()`.
3. Offload non-blocking telemetry, webhook logs, or cleanup after response streaming via `after()` (`next/server`) instead of delaying page TTFB.

### Phase 4: Server Action Mutation Standard
1. Author mutations in dedicated `'use server'` files.
2. Authenticate the caller (`await cookies()` / session lookup) and verify ownership/tenant membership BEFORE mutating state.
3. Validate form input using strict schemas (e.g. Zod `safeParse`) and check downstream `response.ok`.
4. Invalidate stale caches immediately upon success using `revalidatePath()` or `revalidateTag()`.

### Phase 5: PPR and Build Verification
1. Enable `experimental_ppr = true` for hybrid routes (requires `experimental.ppr: 'incremental'` in `next.config`; note Next.js 15 defaults `fetch()` and `GET` Route Handlers to uncached unless opted in via `force-cache` / `revalidate` / `dynamic = 'force-static'`).
2. Wrap dynamic user-specific widgets in `<Suspense fallback={<Skeleton />}>` to keep the shell static.
3. Verify generated route types, strict TypeScript checking, production build, and user-centric E2E flows (`getByRole`, keyboard nav) when Playwright is configured:
   ```bash
   npx next typegen && npx tsc --noEmit && npm run build
   ```

---

## 2. Fatal Mistakes & Critical Anti-Patterns to Avoid
- ❌ Reading `cookies()`, `headers()`, `params`, or `searchParams` synchronously without `await` (or `use()` in Client Components).
- ❌ Relying on Next.js `middleware.ts` cookie existence as the sole authorization gate (middleware is an optimistic check only; always re-verify auth/authz in Server Components, Server Actions, and Route Handlers).
- ❌ Skipping authentication and server-side ownership/tenant authorization checks inside `'use server'` Server Actions (Server Actions are public HTTP POST endpoints).
- ❌ Assuming `fetch()` or `GET` Route Handlers are cached by default in Next.js 15 (they default to uncached unless explicitly configured).
- ❌ Interpolating unvalidated cookie or `FormData` identifiers into backend URLs or `revalidatePath`.
- ❌ Mutating cookies during component render cycles (must be in Server Actions or Route Handlers).
- ❌ Declaring `'use client'` on root layouts or top-level pages.
- ❌ Leaking server database or secret modules into client component bundles (guard with `import 'server-only'`).
- ❌ Navigating with raw HTML `<a>` tags instead of `<Link>`.

## References & Resources
- App Router & Server Components: [references/nextjs-app-router-and-server-components.md](./references/nextjs-app-router-and-server-components.md)
- Async Request APIs: [references/nextjs-async-request-apis.md](./references/nextjs-async-request-apis.md)
- Partial Prerendering (PPR): [references/nextjs-partial-prerendering-ppr.md](./references/nextjs-partial-prerendering-ppr.md)
- Server Actions & Mutations: [references/nextjs-server-actions-and-mutations.md](./references/nextjs-server-actions-and-mutations.md)
- Route Handlers & Middleware: [references/nextjs-route-handlers-and-middleware.md](./references/nextjs-route-handlers-and-middleware.md)
- Data Fetching & Caching: [references/nextjs-caching-and-data-fetching.md](./references/nextjs-caching-and-data-fetching.md)
- Performance Profiling & Anti-Patterns: [references/nextjs-performance-and-antipatterns.md](./references/nextjs-performance-and-antipatterns.md)
- Production Next.js Config: [resources/next-config.mjs](./resources/next-config.mjs)
- Edge Middleware Template: [resources/middleware-template.ts](./resources/middleware-template.ts)
- Standard Route Handler Template: [resources/route-handler-template.ts](./resources/route-handler-template.ts)
- Async Request Page Example: [examples/async_request_page.tsx](./examples/async_request_page.tsx)
- PPR Streaming Layout Example: [examples/ppr_stream_layout.tsx](./examples/ppr_stream_layout.tsx)
- Resilient Server Action Example: [examples/resilient_server_action.ts](./examples/resilient_server_action.ts)
