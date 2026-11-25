# Angular 19 Signals-First Reactivity Architecture

A technical specification of Angular 19 signal primitives, writable signals, computed expressions, effects, and the asynchronous Resource API.

---

## 1. Writable Signals: `signal()`

Writable signals represent reactive state values that can be updated directly.

### Declaration and Mutation
```typescript
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';

@Component({
  selector: 'app-counter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" (click)="increment()">Count: {{ count() }}</button>
    <button type="button" (click)="reset()">Reset</button>
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
import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';

@Component({
  selector: 'app-cart-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
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

## 3. Dependent Writable State: `linkedSignal()`

Angular 19 introduces `linkedSignal()` for writable state that resets whenever a source signal changes (replacing `effect()` + `allowSignalWrites`, which was removed in Angular 19):

```typescript
import { Component, ChangeDetectionStrategy, input, linkedSignal } from '@angular/core';

@Component({
  selector: 'app-shipping-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <select [value]="selectedOption()" (change)="selectedOption.set($any($event.target).value)">
      @for (opt of options(); track opt) {
        <option [value]="opt">{{ opt }}</option>
      }
    </select>
  `
})
export class ShippingSelectorComponent {
  readonly options = input<readonly string[]>(['Standard', 'Express']);

  // Automatically resets to the first option when `options` updates, while remaining writable.
  readonly selectedOption = linkedSignal(() => this.options()[0] ?? 'Standard');
}
```

---

## 4. Side Effects: `effect()`

`effect()` registers an operation that runs whenever one or more signal dependencies change. Angular 19 removed the `allowSignalWrites` option—prefer `computed()` or `linkedSignal()` for derived state rather than writing signals from effects.

### Injection Context & Lifecycle
Effects must be registered within an injection context (constructor or field initializer), or passed `{ injector }`:

```typescript
import { Component, ChangeDetectionStrategy, signal, effect, inject } from '@angular/core';
import { AnalyticsService } from './analytics.service';

@Component({
  selector: 'app-tracker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<button type="button" (click)="trackAction()">Click</button>`
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
Use `untracked()` inside a constructor/injection-context `effect()` when reading a signal without registering it as a reactive dependency:
```typescript
import { effect, untracked } from '@angular/core';

constructor() {
  effect(() => {
    const currentCount = this.count();
    const currentToken = untracked(() => this.authService.token());
    this.syncCount(currentCount, currentToken);
  });
}
```

---

## 5. Asynchronous Data Fetching: `resource()`

Angular 19 introduces the `resource()` API for declarative asynchronous data loading directly linked to signals (note: Angular 19 uses `request:`, renamed to `params:` in Angular 20+ alongside `httpResource()`):

```typescript
import { Component, ChangeDetectionStrategy, signal, resource } from '@angular/core';

interface Product {
  id: string;
  name: string;
  price: number;
}

@Component({
  selector: 'app-product-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (productResource.isLoading()) {
      <p>Loading product...</p>
    } @else if (productResource.error()) {
      <p>Error loading product</p>
      <button type="button" (click)="productResource.reload()">Retry</button>
    } @else if (productResource.hasValue()) {
      @let product = productResource.value()!;
      <h1>{{ product.name }}</h1>
      <p>Price: ${{ product.price }}</p>
    }
  `
})
export class ProductDetailComponent {
  readonly productId = signal<string>('p101');

  readonly productResource = resource({
    // Angular 19 uses `request`; in Angular 20+, use `params` (`loader: async ({ params, abortSignal }) => ...`).
    request: () => ({ id: this.productId() }),
    loader: async ({ request, abortSignal }) => {
      const response = await fetch(`/api/products/${encodeURIComponent(request.id)}`, {
        signal: abortSignal
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch product (${response.status})`);
      }
      return (await response.json()) as Product;
    }
  });
}
```
