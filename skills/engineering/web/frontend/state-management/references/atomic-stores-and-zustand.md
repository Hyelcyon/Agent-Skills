# Atomic Stores and Zustand v5 Client State Architecture

Engineering standards for lightweight, atomic client-side state management using Zustand 5 (`create<State>()(...)`, `useShallow`, middleware composition, and storage security).

---

## 1. When to Use Client Stores

Use client stores strictly for synchronous, transient client UI state:
- Sidebar open/collapsed status, theme preference, wizard step progression, active modal ID.
- Never mirror remote REST/GraphQL server entities in Zustand; keep server data in TanStack Query.

---

## 2. Zustand v5 Curried Store Pattern

In Zustand v5, always use the **curried TypeScript syntax** `create<State>()(...)` so type inference works uniformly across plain stores and middleware-wrapped stores:

```typescript
import { create } from 'zustand';

interface UiState {
  sidebarOpen: boolean;
  activeModal: string | null;
  toggleSidebar: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
  sidebarOpen: true,
  activeModal: null,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null })
}));
```

---

## 3. Atomic Selectors & `useShallow`: Preventing Re-Renders

Never call `useUiStore()` without a selector, and never return a newly allocated object/array from a selector without `useShallow`. In Zustand v5, returning a fresh object without `useShallow` causes unnecessary re-renders and React `useSyncExternalStore` infinite loop errors.

### ❌ Anti-Pattern: Full Store or Un-Memoized Object Selector
```typescript
const { sidebarOpen, toggleSidebar } = useUiStore();
const panel = useUiStore((s) => ({ open: s.sidebarOpen, modal: s.activeModal }));
```

### ✅ Senior Standard: Atomic Selector or `useShallow`
```typescript
import { useShallow } from 'zustand/react/shallow';

const sidebarOpen = useUiStore((state) => state.sidebarOpen);
const { activeModal, closeModal } = useUiStore(
  useShallow((state) => ({
    activeModal: state.activeModal,
    closeModal: state.closeModal
  }))
);
```

---

## 4. Imperative Vanilla Access & Filtered Subscriptions

`store.subscribe(listener)` invokes `listener(state, prevState)` on **every** state change in the store unless filtered or wrapped with `subscribeWithSelector`. Always diff against `prevState` or compose `subscribeWithSelector`:

```typescript
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface LayoutState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useLayoutStore = create<LayoutState>()(
  subscribeWithSelector((set) => ({
    sidebarOpen: true,
    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen }))
  }))
);

export function subscribeToSidebarChanges(callback: (isOpen: boolean) => void): () => void {
  return useLayoutStore.subscribe(
    (state) => state.sidebarOpen,
    (isOpen) => callback(isOpen)
  );
}
```

---

## 5. `persist` Middleware Security & SSR Boundaries

- **Never Persist Sensitive Tokens or PII**: Never write JWTs, OAuth tokens, API keys, passwords, or personally identifiable user data into `localStorage` or `sessionStorage` via `persist`. Keep auth tokens in `HttpOnly`, `Secure` cookies on the server/BFF.
- **Explicit `partialize` Whitelist**: Always define `partialize` so only safe, JSON-serializable UI fields (e.g., `theme`, `sidebarOpen`) are stored, excluding action functions and transient/sensitive flags.
- **SSR Hydration Safety**: In Next.js/Remix SSR, reading `localStorage` during render causes hydration mismatches; keep initial client state deterministic or configure `skipHydration: true` and call `useStore.persist.rehydrate()` inside `useEffect`.
