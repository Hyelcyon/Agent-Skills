type Listener<T> = (state: T, previousState: T) => void;

interface Store<T> {
  getState: () => T;
  setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
  subscribe: (listener: Listener<T>) => () => void;
}

interface UIState {
  isSidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  activeModalId: string | null;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

function createStore<T extends object>(initializer: (set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void, get: () => T) => T): Store<T> {
  let state: T;
  const listeners = new Set<Listener<T>>();

  const getState = () => state;

  const setState = (partial: Partial<T> | ((state: T) => Partial<T>)) => {
    const nextState = typeof partial === 'function' ? (partial as (s: T) => Partial<T>)(state) : partial;
    if (!Object.is(nextState, state)) {
      const previousState = state;
      state = Object.assign({}, state, nextState);
      for (const listener of listeners) {
        listener(state, previousState);
      }
    }
  };

  state = initializer(setState, getState);

  const subscribe = (listener: Listener<T>) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return { getState, setState, subscribe };
}

const uiStore = createStore<UIState>((set, get) => ({
  isSidebarOpen: true,
  theme: 'system',
  activeModalId: null,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setTheme: (theme) => set({ theme }),
  openModal: (modalId) => set({ activeModalId: modalId }),
  closeModal: () => set({ activeModalId: null })
}));

export { createStore, uiStore };
export type { Store, Listener, UIState };
