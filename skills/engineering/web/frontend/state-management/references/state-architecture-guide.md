# Modern Web Frontend State Architecture

A senior runbook defining the boundary between Server State, Client State, and URL State, SSR isolation invariants, and optimistic mutation rollbacks.

---

## 1. The Core Paradigm: Server State vs Client State vs URL State

Traditional global-store architectures mistakenly copied remote server entities (users, posts, products) into client stores, forcing teams to reimplement caching, request deduplication, stale tracking, and background synchronization.

### Modern Division of Responsibilities
1. **Server State (Remote Source of Truth)**:
   - Data owned remotely (API/database) requiring asynchronous fetching, caching, deduplication, and invalidation.
   - Handled exclusively via specialized server-cache libraries such as **TanStack Query v5**, SWR, or RTK Query.
2. **Client State (Local Ephemeral Truth)**:
   - Synchronous, transient UI state owned strictly by the current browser session (modal open/closed, sidebar collapsed, draft panel layout, active theme preference).
   - Handled via lightweight reactive stores (**Zustand v5**, Signals) or scoped React Context.
3. **URL State (Shareable Navigation Truth)**:
   - Search keywords, filters, sort order, pagination cursors, and selected view tabs.
   - Handled via validated `URLSearchParams` (`useSearchParams`, `nuqs`, or typed parsers) so views survive reloads and link sharing.

---

## 2. URL State Synchronization Invariants

- **Validate Before Reading**: Clamp page numbers (`Number.isInteger(page) && page > 0`), validate sort/filter enums against an explicit allowlist, and fall back safely to defaults on malformed query strings.
- **Canonical URLs (Omit Defaults)**: Omit default values (`page=1`, empty `q`) when serializing so URLs stay clean and cache keys do not fragment across `/items` and `/items?page=1`.
- **Replace vs Push History**: Use `history.replaceState` (or router `replace: true`) for live filter/search keystrokes so users do not have to press Browser Back dozens of times; reserve `push` for discrete page/tab navigations.
- **Preserve Unrelated Params**: Merge updated keys onto existing search params instead of wiping unrelated query parameters (`utm_*`, modal flags).

---

## 3. SSR State Isolation Boundary

In SSR frameworks (Next.js App Router, Remix, SvelteKit, Nuxt):
- **Never Share Module Singletons on the Server**: A module-level `export const queryClient = new QueryClient()` or global client store populated during SSR lives in the Node.js process memory across requests and leaks User A's cached data to User B.
- **Per-Request Instantiation**: Instantiate a fresh `QueryClient` per SSR request on the server, and keep a singleton only in the browser (`typeof window !== 'undefined'`).

---

## 4. Optimistic Updates & Rollback Strategy

Optimistic mutations update the UI cache immediately before the network request resolves while guaranteeing recovery on failure.

### Three-Step Invariant
1. **Cancel & Snapshot**: Await `queryClient.cancelQueries({ queryKey })` before reading `getQueryData(queryKey)` so in-flight background refetches cannot overwrite the optimistic state.
2. **Optimistically Set**: Write the anticipated value via `setQueryData(queryKey, updater)` immutably.
3. **Rollback & Reconcile**:
   - In `onError`, restore `previousData` whenever `context?.previousData !== undefined` (never check truthiness alone, because `0`, `false`, `""`, or `[]` may be valid).
   - In `onSettled`, check `if (queryClient.isMutating({ mutationKey }) === 1)` when concurrent optimistic mutations target the same list so only the final settling mutation triggers `invalidateQueries({ queryKey })`.
