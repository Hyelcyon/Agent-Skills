---
name: state-management
description: Use when designing web frontend state architectures, separating Server State from Client State, configuring TanStack Query v5 cache lifecycles, implementing optimistic UI mutations with rollback, building Zustand v5 client stores, or synchronizing URL search parameter state.
---

# Enterprise Frontend State Architecture

Standard methodologies for separating Server State from Client State, implementing TanStack Query v5 caching policies and `queryOptions`, optimistic mutations with rollback guarantees, Zustand v5 stores with `useShallow`, and URL state synchronization.

## When to Use
- Decoupling asynchronous server-fetched data from synchronous client UI state.
- Configuring TanStack Query v5 cache lifecycles (`staleTime`, `gcTime`), `queryOptions`, and object-only signatures.
- Implementing optimistic UI updates with automatic snapshot rollbacks on error.
- Creating lightweight client state stores via Zustand v5 (`create<State>()(...)`, `useShallow`) or reactive Signals.
- Persisting shareable filters, pagination, and sorting in validated URL search parameters.

## When NOT to Use
- Managing backend database transactions or caching (use `query-optimization` or `architecture`).
- Structuring REST or RPC API endpoint contracts (use `api`).

---

## 5-Phase Agent Operational Protocol

```text
Phase 1: State Categorization (Server State vs Client State vs URL State)
Phase 2: Cache Lifecycle & Query Options Definition (staleTime, gcTime, queryOptions)
Phase 3: Client Store Formulation (Zustand v5 curried create, atomic selectors, useShallow)
Phase 4: Optimistic Mutation & Rollback Engineering (cancelQueries, snapshot, onError)
Phase 5: Verification & Storage Security Audit (vitest --run, no tokens/PII in localStorage)
```

### Phase 1: State Categorization
Classify domain state before writing code:
- **Server State**: Remote data managed via TanStack Query v5 (instantiate `QueryClient` per SSR request on the server, never as a shared Node singleton).
- **Client State**: Transient UI interactions (modals, active tabs, drawer toggles) managed via Zustand v5.
- **URL State**: Shareable filters, sorting, and pagination stored in validated `URLSearchParams`.

### Phase 2: Cache Lifecycle & `queryOptions` Definition
Use TanStack Query v5's object-only signatures (`useQuery({ queryKey, queryFn })`) and `queryOptions()` factories so keys and inferred data types stay synchronized across `useQuery`, `prefetchQuery`, and `getQueryData`. Set explicit `staleTime` (e.g., `300_000` ms) and `gcTime` (e.g., `600_000` ms; `cacheTime` was removed in v5).

### Phase 3: Client Store Formulation
Use Zustand v5's curried TypeScript syntax `create<State>()(...)`. Select single primitives directly or multi-field objects with `useShallow` to prevent cascading re-renders:
```typescript
import { useShallow } from 'zustand/react/shallow';

const isModalOpen = useUIStore((state) => state.isModalOpen);
const { theme, setTheme } = useUIStore(
  useShallow((state) => ({ theme: state.theme, setTheme: state.setTheme }))
);
```

### Phase 4: Optimistic Mutation & Rollback
Use v5 object filters in `cancelQueries({ queryKey })` and `invalidateQueries({ queryKey })`. Capture the previous snapshot in `onMutate`, restore it in `onError` whenever `context?.previousData !== undefined`, and invalidate in `onSettled`.

### Phase 5: Verification & Storage Security Audit
Validate state synchronization, stale-cache invalidation, and mutation error rollback using non-blocking single-run tests (never leave `vitest` running in interactive watch mode):
```bash
npx vitest run
```
Never persist sensitive tokens, session credentials, or PII in `localStorage` or `sessionStorage` via Zustand `persist` middleware; always whitelist safe UI fields with `partialize`.

---

## Fatal Mistakes Never to Make

- **Never use TanStack Query v4 positional signatures or `cacheTime` in v5**: `useQuery(key, fn)`, `cancelQueries(key)`, `invalidateQueries(key)`, and `cacheTime` are removed in v5; always pass single options objects (`{ queryKey }`) and `gcTime`.
- **Never duplicate server-fetched entities into client-side `useState` or Zustand stores**: Treat TanStack Query as the single source of truth for remote data.
- **Never return fresh objects/arrays from Zustand selectors without `useShallow`**: `useStore((s) => ({ a: s.a, b: s.b }))` triggers re-renders (and infinite loops in React 19/Zustand v5) on every unrelated store update.
- **Never share a module-level `QueryClient` or user store singleton on SSR servers**: Create per-request instances on the server to prevent cross-request cache/data leakage between users.
- **Never persist auth tokens, secrets, or PII in `localStorage`**: Keep auth credentials in `HttpOnly`, `Secure`, `SameSite` cookies managed by the backend/BFF, and restrict `persist` with an explicit `partialize` allowlist.
- **Never leave optimistic mutations without rollback guards**: Always check `context?.previousData !== undefined` (not truthiness) so valid falsy cache states (`0`, `""`, `false`) roll back properly.

---

## References & Documentation
- State Architecture Runbook: [references/state-architecture-guide.md](./references/state-architecture-guide.md)
- Server Cache & TanStack Query v5: [references/server-cache-and-tanstack-query.md](./references/server-cache-and-tanstack-query.md)
- Atomic Stores & Zustand v5: [references/atomic-stores-and-zustand.md](./references/atomic-stores-and-zustand.md)

## Resources & Examples
- TanStack Query Defaults: [resources/query-client-defaults.json](./resources/query-client-defaults.json)
- Zustand Middleware Setup: [resources/zustand-middleware-config.ts](./resources/zustand-middleware-config.ts)
- Query Key Factory Template: [resources/query-key-factory.ts](./resources/query-key-factory.ts)
- Optimistic Mutation Implementation: [examples/optimistic_mutation.ts](./examples/optimistic_mutation.ts)
- Type-Safe Reactive Store: [examples/zustand_store.ts](./examples/zustand_store.ts)
- URL Search Params State Example: [examples/url_search_params_state.ts](./examples/url_search_params_state.ts)
