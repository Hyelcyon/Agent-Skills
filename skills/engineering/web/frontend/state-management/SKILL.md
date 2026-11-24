---
name: state-management
description: Use when designing web frontend state architectures, separating Server State from Client State, configuring TanStack Query cache lifecycles, or implementing optimistic UI mutations with rollback.
---

# Enterprise Frontend State Architecture

Standard methodologies for separating Server State from Client State, implementing TanStack Query caching policies, optimistic mutations with rollback guarantees, and lightweight reactive stores.

## When to Use
- Decoupling asynchronous server-fetched data from synchronous client UI state.
- Configuring TanStack Query / SWR cache lifecycles (`staleTime`, `gcTime`).
- Implementing optimistic UI updates with automatic snapshot rollbacks on error.
- Creating lightweight client state stores via Zustand or reactive Signals.

## When NOT to Use
- Managing backend database transactions or caching (use `query-optimization` or `architecture`).
- Structuring REST or RPC API endpoint contracts (use `api`).

---

## 5-Phase Agent Operational Protocol

```
Phase 1: State Categorization (Server State vs Client State vs URL State)
Phase 2: Cache Lifecycle & Stale Policy Definition (staleTime, gcTime)
Phase 3: Client Store Formulation (Zustand selectors, minimal slice boundaries)
Phase 4: Optimistic Mutation & Rollback Engineering (onMutate snapshot, onError)
Phase 5: State Synchronization & DevTools Verification
```

### Phase 1: State Categorization
Classify domain state:
- **Server State**: Remote data managed via TanStack Query/SWR.
- **Client State**: Transient UI interactions (modals, active tabs) managed via Zustand.
- **URL State**: Shareable filters and pagination stored in query parameters.

### Phase 2: Cache Lifecycle Definition
Configure explicit cache staleness boundaries. Prevent infinite network re-fetch loops by setting reasonable `staleTime` (e.g. 5 minutes) and `gcTime` (e.g. 10 minutes).

### Phase 3: Client Store Formulation
Create focused, immutable stores with granular selectors to prevent unnecessary component re-renders:
```typescript
const isModalOpen = useUIStore((state) => state.isModalOpen);
```

### Phase 4: Optimistic Mutation & Rollback
Immediately update UI cache on user action. Capture previous snapshot in `onMutate` and restore previous state in `onError` if backend mutations fail.

### Phase 5: Verification & Sync Proof
Validate state consistency using query DevTools and automated component tests simulating network failures.

---

## Prohibited Anti-Patterns

- ❌ Duplicating server-fetched data into client-side `useState` or global stores.
- ❌ Zero `staleTime` defaults that trigger network cascades on every window focus.
- ❌ Mutating client store state directly without immutable reducers or setters.
- ❌ Executing optimistic mutations without snapshot capture and error rollback handlers.
- ❌ Storing shareable filter or pagination parameters in memory instead of URL search params.

---

## References & Documentation
- State Architecture Runbook: [references/state-architecture-guide.md](./references/state-architecture-guide.md)
- Server Cache & TanStack Query: [references/server-cache-and-tanstack-query.md](./references/server-cache-and-tanstack-query.md)
- Atomic Stores & Zustand: [references/atomic-stores-and-zustand.md](./references/atomic-stores-and-zustand.md)

## Resources & Examples
- TanStack Query Defaults: [resources/query-client-defaults.json](./resources/query-client-defaults.json)
- Zustand Middleware Setup: [resources/zustand-middleware-config.ts](./resources/zustand-middleware-config.ts)
- Query Key Factory Template: [resources/query-key-factory.ts](./resources/query-key-factory.ts)
- Optimistic Mutation Implementation: [examples/optimistic_mutation.ts](./examples/optimistic_mutation.ts)
- Type-Safe Reactive Store: [examples/zustand_store.ts](./examples/zustand_store.ts)
- URL Search Params State Example: [examples/url_search_params_state.ts](./examples/url_search_params_state.ts)
