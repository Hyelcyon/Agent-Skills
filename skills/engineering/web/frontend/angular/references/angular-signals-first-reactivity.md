# Angular 19 Signals-First Reactivity Architecture

A technical specification of Angular 19 signal primitives, writable signals, computed expressions, effects, and the asynchronous Resource API.

---

## 1. Writable Signals: `signal()`

Writable signals represent reactive state values that can be updated directly.

### Declaration and Mutation
```typescript
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-counter',
  standalone: true,
  template: `
    <button (click)="increment()">Count: {{ count() }}</button>
    <button (click)="reset()">Reset</button>
  `
})
export class CounterComponent {
  readonly count = signal<number>(0);

  increment(): void {
    this.count.update((current) => current + 1);
  }

  reset(): void {
    this.count.set(0);
  }
}
```

### Immutable Updates Mandate
Never mutate signal internal objects or arrays directly. Always produce a new reference using `.update()`:
```typescript
const items = signal<readonly string[]>(['alpha', 'beta']);

items.update((list) => [...list, 'gamma']);
```

### Custom Equality Comparison
When tracking complex objects, provide a custom `equal` comparator to prevent unnecessary downstream recalculations:
```typescript
interface UserProfile {
  id: string;
  version: number;
}

const user = signal<UserProfile>(
  { id: 'u1', version: 1 },
  { equal: (a, b) => a.id === b.id && a.version === b.version }
);
```

---

## 2. Derived Reactivity: `computed()`

`computed()` produces a read-only signal derived from one or more reactive dependencies.

### Characteristics
- Memoized: Only recomputes when one of its read signals changes.
- Lazy evaluation: Computation is deferred until the signal is actually read.
- Glitch-free: Angular ensures atomic updates with zero intermediate torn reads.

```typescript
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-cart-summary',
  standalone: true,
  template: `
    <p>Subtotal: {{ subtotal() }}</p>
    <p>Tax: {{ tax() }}</p>
    <p>Total: {{ total() }}</p>
  `
})
export class CartSummaryComponent {
  readonly items = signal<Array<{ price: number; quantity: number }>>([
    { price: 100, quantity: 2 },
    { price: 50, quantity: 1 }
  ]);
  readonly taxRate = signal<number>(0.1);

  readonly subtotal = computed(() =>
    this.items().reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  readonly tax = computed(() => this.subtotal() * this.taxRate());

  readonly total = computed(() => this.subtotal() + this.tax());
}
```

### Invariants for `computed()`
- Computed expressions must be pure and side-effect free.
- Never call `.set()` or `.update()` on other signals inside a computed expression.

---

## 3. Side Effects: `effect()`

`effect()` registers an operation that runs whenever one or more signal dependencies change.

### Injection Context & Lifecycle
Effects must be registered within an injection context (constructor or field initializer).

```typescript
import { Component, signal, effect, inject } from '@angular/core';
import { AnalyticsService } from './analytics.service';

@Component({
  selector: 'app-tracker',
  standalone: true,
  template: `<button (click)="trackAction()">Click</button>`
})
export class TrackerComponent {
  private readonly analytics = inject(AnalyticsService);
  readonly actionCount = signal<number>(0);

  constructor() {
    effect((onCleanup) => {
      const count = this.actionCount();
      const timer = setTimeout(() => {
        this.analytics.sendEvent('action_count', { count });
      }, 300);

      onCleanup(() => {
        clearTimeout(timer);
      });
    });
  }

  trackAction(): void {
    this.actionCount.update((c) => c + 1);
  }
}
```

### Untracking Signals
Use `untracked()` when reading a signal inside an effect without registering it as a reactive dependency:
```typescript
import { effect, untracked } from '@angular/core';

effect(() => {
  const currentCount = this.count();
  const currentToken = untracked(() => this.authService.token());
  this.syncCount(currentCount, currentToken);
});
```

---

## 4. Asynchronous Data Fetching: `resource()`

Angular 19 introduces the `resource()` API for declarative asynchronous data loading directly linked to signals.

```typescript
import { Component, signal, resource } from '@angular/core';

interface Product {
  id: string;
  name: string;
  price: number;
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  template: `
    @if (productResource.isLoading()) {
      <p>Loading product...</p>
    } @else if (productResource.error()) {
      <p>Error loading product</p>
    } @else if (productResource.value(); as product) {
      <h1>{{ product.name }}</h1>
      <p>Price: \${{ product.price }}</p>
    }
  `
})
export class ProductDetailComponent {
  readonly productId = signal<string>('p101');

  readonly productResource = resource({
    request: () => ({ id: this.productId() }),
    loader: async ({ request, abortSignal }) => {
      const response = await fetch(`/api/products/${request.id}`, {
        signal: abortSignal
      });
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      return (await response.json()) as Product;
    }
  });
}
```
