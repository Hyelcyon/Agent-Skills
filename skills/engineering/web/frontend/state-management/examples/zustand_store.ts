import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Client-only UI layout state managed by Zustand v5.
 */
interface UIState {
  isSidebarOpen: boolean;
  theme: ThemeMode;
  activeModalId: string | null;
  toggleSidebar: () => void;
  setTheme: (theme: ThemeMode) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

/**
 * Curried Zustand v5 store using subscribeWithSelector for filtered non-React listeners.
 */
const useUIStore = create<UIState>()(
  subscribeWithSelector((set) => ({
    isSidebarOpen: true,
    theme: 'system',
    activeModalId: null,
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    setTheme: (theme) => set({ theme }),
    openModal: (modalId) => set({ activeModalId: modalId }),
    closeModal: () => set({ activeModalId: null })
  }))
);

/**
 * Selects modal state and actions via useShallow so unrelated theme/sidebar changes do not re-render callers.
 */
function useModalControls() {
  return useUIStore(
    useShallow((state) => ({
      activeModalId: state.activeModalId,
      openModal: state.openModal,
      closeModal: state.closeModal
    }))
  );
}

/**
 * Subscribes imperatively to theme transitions without firing on sidebar or modal changes.
 */
function subscribeToThemeChange(onChange: (next: ThemeMode, prev: ThemeMode) => void): () => void {
  return useUIStore.subscribe((state) => state.theme, onChange);
}

export { useUIStore, useModalControls, subscribeToThemeChange };
export type { UIState, ThemeMode };
