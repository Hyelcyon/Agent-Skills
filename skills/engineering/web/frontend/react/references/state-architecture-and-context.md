# React 19 Architecture: State Boundaries, Context & Store Design

A senior architectural runbook on separating Server State from Client State, React Context performance boundaries, and atomic client store design.

---

## 1. The Tripartite State Model

State in modern React applications falls strictly into three tiers:

| State Tier | Characteristics | Recommended Solution |
| :--- | :--- | :--- |
| **Server State** | Asynchronous, persisted remotely, shared across multiple clients, requires caching & revalidation. | **React Server Components (RSC)** for initial read; **TanStack Query v5** or **SWR** for client-interactive caching. |
| **Client State** | Ephemeral, synchronous, local to the user session (active modals, sidebar toggles, form drafts). | **Zustand**, **Signals**, or React `useState` / `useReducer` at component subtrees. |
| **URL State** | Shareable navigation parameters (filters, pagination cursors, search queries). | `useSearchParams` / framework router query strings. |

---

## 2. React Context Performance Caveats

React Context is a dependency injection mechanism, NOT a state management engine:
- **The Context Re-render Trap**: When the value of a Context Provider changes, EVERY component consuming that context re-renders, even if it only accesses an unrelated property of the context value.
- **Rule for Context**:
  - Use Context for low-frequency updates: themes (dark/light), active authenticated user profile, internationalization locales.
  - NEVER use Context for high-frequency updates: mouse coordinates, input keystrokes, real-time WebSocket tick feeds, active animation frames.

---

## 3. Atomic Store Architecture with Zustand

For complex client-side UI workflows, use lightweight atomic stores (such as Zustand) outside the React tree:

```typescript
import { create } from 'zustand';

interface EditorState {
  activeTab: 'code' | 'preview';
  isSidebarExpanded: boolean;
  setActiveTab: (tab: 'code' | 'preview') => void;
  toggleSidebar: () => void;
}

export const useEditorStore = create<EditorState>()((set) => ({
  activeTab: 'code',
  isSidebarExpanded: true,
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleSidebar: () => set((state) => ({ isSidebarExpanded: !state.isSidebarExpanded })),
}));
```

Components subscribe only to the specific slice of state they consume:
```tsx
const isSidebarExpanded = useEditorStore((state) => state.isSidebarExpanded);
```
When `activeTab` changes, this component does NOT re-render, eliminating wasted render cycles.

---

## 4. Compound Components Over Boolean-Prop Explosion

Avoid scaling reusable widgets via dozens of boolean flags (`isCompact`, `withBorder`, `hideHeader`). Expose explicit semantic subcomponents sharing React Context:
- **Anti-Pattern**: `<DataCard title="Usage" compact showFooter noPadding={false} />`
- **Composition Pattern**: `<DataCard><DataCard.Header>Usage</DataCard.Header><DataCard.Body>...</DataCard.Body></DataCard>`
Callers rearrange, omit, or customize slots without modifying core component internals.
