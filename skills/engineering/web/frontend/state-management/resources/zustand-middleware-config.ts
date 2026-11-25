import { create, type StateCreator } from 'zustand';
import { devtools, persist, createJSONStorage, type StateStorage } from 'zustand/middleware';

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};

function getSafeStorage(): StateStorage {
  // Guard against SSR environments where Web Storage APIs do not exist.
  return typeof window === 'undefined' ? noopStorage : window.localStorage;
}

export interface PersistentStoreOptions<T, TPersisted> {
  name: string;
  /** Whitelist strictly non-sensitive, serializable UI preferences; never persist tokens or PII. */
  partialize: (state: T) => TPersisted;
  version?: number;
  devtoolsEnabled?: boolean;
  skipHydration?: boolean;
  storageProvider?: () => StateStorage;
}

/**
 * Creates a Zustand v5 store with explicit partialize persistence and dev-gated DevTools.
 *
 * @param initializer - Zustand state creator receiving (set, get, api).
 * @param options - Storage key, mandatory partialize allowlist, and DevTools toggle.
 */
export function createPersistentStore<T extends object, TPersisted extends Partial<T>>(
  initializer: StateCreator<T, [['zustand/devtools', never], ['zustand/persist', unknown]], []>,
  options: PersistentStoreOptions<T, TPersisted>
) {
  return create<T>()(
    devtools(
      persist(initializer, {
        name: options.name,
        version: options.version ?? 1,
        partialize: options.partialize,
        skipHydration: options.skipHydration ?? false,
        storage: createJSONStorage(options.storageProvider ?? getSafeStorage)
      }),
      {
        name: options.name,
        enabled: options.devtoolsEnabled ?? false
      }
    )
  );
}
