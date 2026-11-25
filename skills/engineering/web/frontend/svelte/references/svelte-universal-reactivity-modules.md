# Svelte 5 Universal Reactivity Modules (`.svelte.ts`)

Engineering standards for authoring shared reactive models in `.svelte.ts` / `.svelte.js` modules, obeying ES module export constraints, and preventing SvelteKit SSR state leakage.

---

## 1. The `.svelte.ts` Extension & Module Export Rule

Runes (`$state`, `$derived`, `$effect`) compile inside `.svelte` files and TypeScript/JavaScript modules named `*.svelte.ts` / `*.svelte.js`.

### ❌ Compiler Error (`state_invalid_export`): Exporting Reassigned `$state`
```typescript
// FAILS COMPILE: Cannot export state from a module if it is reassigned.
export let count = $state(0);
```
Because ES module exports are live bindings, reassigning `count` externally cannot be tracked across module boundaries.

### ✅ Valid Universal Export Patterns
1. **Export a `const` object or class instance** and mutate its reactive properties (`count` property inside the class/object).
2. **Export getter/factory functions** (`createCounterModel()`) encapsulating private `$state` bindings.

---

## 2. CRITICAL: SvelteKit SSR State Leakage Prevention

Node.js and Edge SSR runtimes keep `.svelte.ts` module variables alive across concurrent user requests.

- **❌ Danger**: Instantiating `export const userCart = new CartManager()` at module top level in a SvelteKit app leaks User A's cart items into User B's SSR HTML response.
- **✅ SSR-Safe Standard**: Instantiate per-user / per-request models inside root `+layout.svelte` (or a page component) and distribute them down the tree via `setContext` / `getContext`, which Svelte isolates cleanly per render request.

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
import { setContext } from 'svelte';
import { CartManager } from '$lib/cart.svelte';

setContext('cart', new CartManager());
let { children } = $props();
</script>

{@render children()}
```

---

## 3. Stateful Domain Model: Reactive Class Architecture

Use `$state` and cached `$derived` class fields inside `.svelte.ts` classes:

```typescript
export interface CartItem {
  id: string;
  price: number;
  quantity: number;
}

export class CartManager {
  private items = $state<CartItem[]>([]);
  private discountPercentage = $state<number>(0);

  totalItems = $derived(this.items.reduce((sum, item) => sum + item.quantity, 0));
  rawSubtotal = $derived(this.items.reduce((sum, item) => sum + item.price * item.quantity, 0));
  finalTotal = $derived(this.rawSubtotal * (1 - this.discountPercentage / 100));

  get currentItems(): ReadonlyArray<CartItem> {
    return this.items;
  }

  addItem(id: string, price: number, quantity: number = 1): void {
    const existing = this.items.find((item) => item.id === id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({ id, price, quantity });
    }
  }

  applyDiscount(percentage: number): void {
    this.discountPercentage = Math.max(0, Math.min(100, percentage));
  }

  removeItem(id: string): void {
    const index = this.items.findIndex((item) => item.id === id);
    if (index !== -1) {
      this.items.splice(index, 1);
    }
  }
}
```

---

## 4. Factory Function Composable Pattern

When returning a reactive object from a factory function, expose getters backed by `$state` and `$derived` so consumers read live reactive properties:

```typescript
export function createCounterModel(initialValue: number = 0, step: number = 1) {
  let count = $state(initialValue);
  let isEven = $derived(count % 2 === 0);

  function increment(): void {
    count += step;
  }

  function decrement(): void {
    count -= step;
  }

  function reset(): void {
    count = initialValue;
  }

  return {
    get count() { return count; },
    get isEven() { return isEven; },
    increment,
    decrement,
    reset
  };
}
```
Note: Component consumers read `counter.count` directly (`{counter.count}`) without any `$` store prefix.
