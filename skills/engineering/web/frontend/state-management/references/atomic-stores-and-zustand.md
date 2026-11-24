# Atomic Stores and Zustand Client State Architecture

Engineering standards for lightweight, atomic client-side state management using Zustand 5.

---

## 1. When to Use Client Stores

Use client stores strictly for transient UI state:
- Sidebar open/collapsed status, active theme mode, wizard step progression, modal dialog open states.
- Never store remote REST/GraphQL cache data in client stores.

---

## 2. Zustand 5 Minimal Store Pattern

Declare stores with explicit state and action types:

```typescript
import { create } from 'zustand';

interface UiState {
  sidebarOpen: boolean;
  activeModal: string | null;
  toggleSidebar: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  activeModal: null,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  openModal: (modalId: string) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null })
}));
```

---

## 3. Atomic Selectors: Preventing Component Re-Renders

Never destructure the full store object in consumer components. Always pass an atomic selector function:

### ❌ Anti-Pattern: Full Store Destructuring
```typescript
const { sidebarOpen, toggleSidebar } = useUiStore();
```

### ✅ The Senior Standard: Atomic Selector
```typescript
const sidebarOpen = useUiStore((state) => state.sidebarOpen);
const toggleSidebar = useUiStore((state) => state.toggleSidebar);
```

Passing atomic selectors ensures components re-render ONLY when their specific selected slice changes, preventing cascading render cycles.

---

## 4. Vanilla Store Decoupling Outside UI Trees

Access and mutate Zustand stores imperatively outside UI render cycles (e.g. inside background workers or interceptors):

```typescript
export function closeActiveModalFromWorker(): void {
  useUiStore.getState().closeModal();
}

export function subscribeToSidebarChanges(callback: (isOpen: boolean) => void): () => void {
  return useUiStore.subscribe((state) => callback(state.sidebarOpen));
}
```
