# Vue 3.5 Architecture: Custom Composable Design & Pinia Stores

A senior engineering guide to authoring reusable composables (`use*`), flexible input unwrapping with `toValue()`, and Pinia store architecture.

---

## 1. Composable Authoring Conventions

Composables encapsulate stateful business logic. Senior guidelines dictate:
1. **Naming**: Always prefix composable functions with `use` (e.g. `useUserSession`, `useCart`).
2. **Flexible Input (`MaybeRefOrGetter<T>`)**:
   - Accept arguments that can be raw values, `Ref<T>`, or getter functions (`() => T`).
   - Use `toValue()` from Vue to normalize and unwrap the input automatically:
     ```typescript
     import { computed, toValue, type MaybeRefOrGetter } from 'vue';

     export function useMultiplier(factor: MaybeRefOrGetter<number>) {
       const resolvedFactor = computed(() => toValue(factor));
       return { resolvedFactor };
     }
     ```
3. **Return Plain Objects with Refs**:
   - Return plain objects of refs rather than a reactive object, allowing consumers to destructure return values without losing reactivity.

---

## 2. Global State with Pinia

Pinia is the official, lightweight, type-safe store architecture for Vue:

### Setup Store Pattern (Preferred over Options Stores)
Define stores using `<script setup>` style syntax:

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null);
  const isAuthenticated = computed(() => currentUser.value !== null);

  function login(userData: User) {
    currentUser.value = userData;
  }

  function logout() {
    currentUser.value = null;
  }

  return { currentUser, isAuthenticated, login, logout };
});
```
This aligns 1:1 with standard component composition and offers optimal TypeScript type inference.
