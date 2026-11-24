# Svelte 5 Universal Reactivity Modules (`.svelte.ts`)

Engineering standards for authoring shared reactive models, domain services, and reusable logic outside components.

---

## 1. The `.svelte.ts` Extension Standard

In Svelte 5, Runes can be executed anywhere in the codebase—not just inside `.svelte` Single File Components.
To allow the Svelte compiler to process Runes in standard TypeScript files, name the file with the `.svelte.ts` extension.

---

## 2. Stateful Domain Model: Reactive Class Architecture

Define stateful business logic using standard TypeScript classes backed by `$state` and `$derived`:

```typescript
export class CartManager {
  private items = $state<Array<{ id: string; price: number; quantity: number }>>([]);
  private discountPercentage = $state<number>(0);

  get totalItems(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  get rawSubtotal(): number {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  get finalTotal(): number {
    return this.rawSubtotal * (1 - this.discountPercentage / 100);
  }

  get currentItems(): ReadonlyArray<{ id: string; price: number; quantity: number }> {
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

## 3. Factory Function Composable Pattern

Alternatively, encapsulate state and methods in a factory function closure:

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

---

## 4. Consuming Universal Modules in Svelte Components

Consuming universal modules inside `.svelte` files requires zero extra subscription glue:

```svelte
<script lang="ts">
import { CartManager } from './cart.svelte';

const cart = new CartManager();
</script>

<div class="cart-widget">
  <p>Items in Cart: {cart.totalItems}</p>
  <p>Total: \${cart.finalTotal.toFixed(2)}</p>
  <button onclick={() => cart.addItem('prod_1', 49.99, 1)}>Add Product</button>
</div>
```

Any component reading `cart.totalItems` or `cart.finalTotal` automatically subscribes to underlying signal changes and updates reactively.
