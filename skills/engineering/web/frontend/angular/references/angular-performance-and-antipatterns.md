# Angular 19 Performance Profiling and Anti-Patterns

A technical guide to Angular 19 performance optimization, RxJS-Signal interoperability, and the Top 10 architectural anti-patterns.

---

## 1. Change Detection Optimization: `OnPush`

Even before fully removing Zone.js, every component must specify `ChangeDetectionStrategy.OnPush`:

```typescript
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';

@Component({
  selector: 'app-perf-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div>Active: {{ isActive() }}</div>`
})
export class PerfProfileComponent {
  readonly isActive = signal<boolean>(true);
}
```

### Benefits of `OnPush`
- Prevents component dirty-checking unless its inputs change, an event fires within it, or a bound signal notifies an update.
- Cuts change detection passes in large trees by up to 90%.

---

## 2. RxJS and Signal Interoperability: `@angular/core/rxjs-interop`

Bridge RxJS streams into signals declaratively:

### Converting Observables to Signals with `toSignal`
`toSignal` automatically handles subscription and unsubscription according to the component lifecycle:

```typescript
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';

interface ServerMetrics {
  cpuUsage: number;
  memoryUsage: number;
}

@Component({
  selector: 'app-metrics-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (metrics(); as m) {
      <div>CPU: {{ m.cpuUsage }}% | RAM: {{ m.memoryUsage }}MB</div>
    }
  `
})
export class MetricsPanelComponent {
  private readonly http = inject(HttpClient);

  readonly metrics = toSignal(
    this.http.get<ServerMetrics>('/api/metrics'),
    { initialValue: null }
  );
}
```

---

## 3. Top 10 Angular Anti-Patterns

### 1. In-Place Signal Mutation
- ❌ **Anti-Pattern**: Calling `.push()` or modifying properties directly on signal references:
  ```typescript
  this.items().push(newItem);
  ```
- ✅ **The Senior Fix**: Always use `.update()` or `.set()` with immutable copies:
  ```typescript
  this.items.update((list) => [...list, newItem]);
  ```

### 2. Manual Unmanaged RxJS Subscriptions
- ❌ **Anti-Pattern**: Calling `.subscribe()` inside components without storing and destroying the subscription.
- ✅ **The Senior Fix**: Convert to signal via `toSignal()`, or use `takeUntilDestroyed()`.

### 3. Mutating Signals Inside `computed()`
- ❌ **Anti-Pattern**: Writing to writable signals inside computed getters.
- ✅ **The Senior Fix**: Keep `computed()` getters strictly pure and read-only.

### 4. Overusing `effect()` for State Derivation
- ❌ **Anti-Pattern**: Using `effect()` (or deprecated `allowSignalWrites`) to listen to Signal A and write to Signal B.
- ✅ **The Senior Fix**: Use `computed()` for read-only derived values and `linkedSignal()` for derived writable/resettable state.

### 5. Tracking by Array Index in `@for`
- ❌ **Anti-Pattern**: Using `track $index` for dynamic collections that can be sorted or filtered.
- ✅ **The Senior Fix**: Always track by unique entity ID: `track item.id`.

### 6. Introducing `NgModule` Containers or Redundant `standalone: true`
- ❌ **Anti-Pattern**: Writing `NgModule` definitions for new features, or repeating `standalone: true` on Angular 19+ components.
- ✅ **The Senior Fix**: Rely on Angular 19+ standalone-by-default declarations without `NgModule` boilerplate.

### 7. Relying on Zone.js Default Dirty Checking
- ❌ **Anti-Pattern**: Leaving components on default change detection with full Zone.js scans.
- ✅ **The Senior Fix**: Use `provideZonelessChangeDetection()` (Angular 20+ stable; `provideExperimentalZonelessChangeDetection()` in Angular 19) and `ChangeDetectionStrategy.OnPush`.

### 8. Direct DOM Access via `document.getElementById`
- ❌ **Anti-Pattern**: Bypassing Angular's renderer and queries with browser globals.
- ✅ **The Senior Fix**: Use `viewChild()` signal queries or template variable bindings.

### 9. Expensive Synchronous Calculations in Templates
- ❌ **Anti-Pattern**: Calling complex functions directly in template interpolations: `{{ calculateFinancialReport() }}`.
- ✅ **The Senior Fix**: Compute values once via `computed()` signals.

### 10. Invoking `inject()` Outside Injection Context
- ❌ **Anti-Pattern**: Calling `inject()` inside asynchronous callbacks or lifecycle hooks after construction.
- ✅ **The Senior Fix**: Call `inject()` at field declaration time, or wrap with `runInInjectionContext()`.
