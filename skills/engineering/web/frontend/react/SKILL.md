---
name: react
description: Use when building, refactoring, or optimizing React applications, implementing React 19 Server Actions and useActionState, configuring React Server Components (RSC), or eliminating manual memoization debt under the React Compiler.
---

# Enterprise React 19 Architecture & Agent Operational Runbook

Senior engineering standards for modern React 19 web applications: the React Compiler, Server Actions, Server Components (RSC), `useOptimistic`, direct `ref` props, and anti-pattern elimination.

## When to Use
- Writing or refactoring React components using React 19 idiomatic standards.
- Handling asynchronous form submissions and mutations via Server Actions and `useActionState`.
- Implementing zero-latency optimistic UI transitions with `useOptimistic`.
- Structuring component trees between Server Components and Client Components (`'use client'`).
- Removing legacy manual memoization boilerplate (`useMemo`, `useCallback`, `forwardRef`).

## When NOT to Use
- Managing global browser router transitions without React framework bindings (use `ui-ux`).
- Configuring backend database transactions or API servers (use `api` or `architecture`).

---

## 1. Autonomous Agent Operational Protocol

When developing or refactoring React components, the agent must execute these 5 sequential phases:

```
[Phase 1: Boundary Audit] ──> [Phase 2: Data Placement] ──> [Phase 3: Action & Mutation] ──> [Phase 4: Compiler Simplicity] ──> [Phase 5: Render Verification]
   Identify Server vs Client      Colocate fetches to server      Adopt useActionState/Optimistic     Eliminate manual useMemo        Verify zero client waterfalls
```

### Phase 1: Server vs Client Boundary Audit
1. Keep the component on the server by default. Do not add `'use client'` unless the component:
   - Uses React state hooks (`useState`, `useReducer`, `useActionState`).
   - Uses browser lifecycle effects or event listeners (`onClick`, `onChange`).
   - Uses browser-only APIs (`window`, `localStorage`, `IntersectionObserver`).
2. Push `'use client'` down to the leaf interactive elements; wrap client leaves inside Server Component shells.

### Phase 2: Server-First Data Placement
1. Fetch data directly in Server Components using asynchronous async/await components.
2. Eliminate client-side `useEffect` data fetching waterfalls.

### Phase 3: Action & Mutation Standard
1. Use native form actions enhanced by `useActionState`:
   ```tsx
   const [state, formAction, isPending] = useActionState(serverAction, initialState);
   ```
2. Wrap rapid UI updates in `useOptimistic` to display anticipated state before network completion.

### Phase 4: Compiler-Assisted Simplicity
1. Do not defensively wrap functions in `useCallback` or values in `useMemo` unless profiling proves necessary.
2. Pass `ref` directly as a prop; do not wrap components in `forwardRef`.

### Phase 5: Render Verification
Verify that:
- No hydration mismatch warnings occur between server HTML and client hydration.
- The client bundle size excludes heavy server dependencies (e.g. database clients, markdown parsers).

---

## 2. Critical Anti-Patterns to Avoid
- ❌ Using `useEffect` to fetch data on component mount (creates layout shifts and waterfalls).
- ❌ Placing `'use client'` at the root or layout level (destroys Server Component benefits).
- ❌ Manually wrapping all callbacks in `useCallback` under React 19.
- ❌ Wrapping components in `forwardRef` (deprecated in React 19; pass `ref` directly).

## Specialized Architecture References (Modular 7-Reference Standard)
- 1. Compiler & Memoization: [references/react-compiler-and-memoization.md](./references/react-compiler-and-memoization.md)
- 2. Server Components (RSC): [references/react-server-components-rsc.md](./references/react-server-components-rsc.md)
- 3. Server Actions & Mutations: [references/server-actions-and-mutations.md](./references/server-actions-and-mutations.md)
- 4. Modern Hooks & Lifecycle: [references/modern-hooks-and-lifecycle.md](./references/modern-hooks-and-lifecycle.md)
- 5. State Architecture & Context: [references/state-architecture-and-context.md](./references/state-architecture-and-context.md)
- 6. Asset Loading & Metadata: [references/asset-loading-and-metadata.md](./references/asset-loading-and-metadata.md)
- 7. Performance Profiling & Anti-Patterns: [references/performance-profiling-and-antipatterns.md](./references/performance-profiling-and-antipatterns.md)
- 8. Production Folder & File Structure: [references/production-frontend-architecture-and-folder-structure.md](./references/production-frontend-architecture-and-folder-structure.md)

## Resources & Examples
- React Compiler Config: [resources/react-compiler.json](./resources/react-compiler.json)
- Strict TypeScript React Config: [resources/tsconfig-react.json](./resources/tsconfig-react.json)
- ESLint React Compiler Config: [resources/eslint-react.json](./resources/eslint-react.json)
- Modern Task Form Action Example: [examples/modern_action_form.tsx](./examples/modern_action_form.tsx)
- Server Component Streaming Example: [examples/server_component_stream.tsx](./examples/server_component_stream.tsx)
- Optimistic Todo List Example: [examples/optimistic_todo_list.tsx](./examples/optimistic_todo_list.tsx)
