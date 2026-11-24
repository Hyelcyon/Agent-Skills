# Modern Web Frontend State Architecture

A senior runbook defining the boundary between Server State and Client State, optimistic UI updates, and fine-grained reactivity.

---

## 1. The Core Paradigm: Server State vs Client State

Traditional Redux/global-store architectures mistakenly stored server data (users, posts, products) in client stores, requiring manual fetching, loading flags, caching, deduplication, and error management.

### Modern Division of Responsibilities
1. **Server State (Remote Source of Truth)**:
   - Data stored remotely (database/API) that requires asynchronous fetching, caching, invalidation, and synchronization.
   - Handled exclusively via specialized server cache libraries: **TanStack Query (React Query)**, SWR, or RTK Query.
2. **Client State (Local Ephemeral Truth)**:
   - Synchronous, transient UI state owned purely by the browser (modals open/closed, form input drafts, active theme, sidebar collapsed).
   - Handled via lightweight reactive stores: **Zustand**, **Signals**, or React context for subtree scoping.
3. **URL State (Shareable Navigation Truth)**:
   - Filters, pagination cursors, search keywords, selected tabs.
   - Handled via URL search parameters (`useSearchParams`, `nuqs`) to ensure pages are bookmarkable and shareable.

---

## 2. Optimistic Updates & Rollback Strategy

Optimistic mutations update the client UI immediately before the network request resolves, providing zero perceived latency.

### Three-Step Invariant
1. **Cancel & Snapshot**: Cancel ongoing refetches for the query key and take a snapshot of the previous data cache.
2. **Optimistically Set**: Immediately mutate the local query cache with the anticipated new value.
3. **Rollback on Error**: If the server mutation fails, restore the snapshot into the cache. On success, invalidate the query key to fetch the authoritative server state.
