import { create, type StateCreator } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';

export function createPersistentStore<T>(
  name: string,
  initializer: StateCreator<T, [['zustand/devtools', never], ['zustand/persist', unknown]], []>
) {
  return create<T>()(
    devtools(
      persist(initializer, {
        name,
        storage: createJSONStorage(() => sessionStorage)
      }),
      { name }
    )
  );
}
