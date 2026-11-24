# Angular 19 Zoneless Change Detection

Architecture, setup, runtime mechanics, and migration patterns for running Angular 19 applications completely without Zone.js.

---

## 1. The Zone.js Legacy Problem

Historically, Angular relied on `zone.js` to monkey-patch all asynchronous browser APIs (`Promise`, `setTimeout`, `addEventListener`, `fetch`, `requestAnimationFrame`).
Whenever an asynchronous event resolved, Zone.js signaled Angular to perform dirty checking across the entire component tree from the root down.

### Drawbacks of Zone.js
- **Bundle Weight**: Adds ~30-40 KB of minified runtime overhead.
- **Micro-Task Monkey Patching**: Incompatible with native browser async/await optimizations and causes debugging stack-trace pollution.
- **Over-Rendering**: Any asynchronous callback marks the entire application dirty regardless of whether any data changed.

---

## 2. Configuring Zoneless in Angular 19

In Angular 19, zoneless change detection is configured via the application bootstrap provider:

```typescript
import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideRouter(routes)
  ]
};
```

### Removing Zone.js Polyfill
In `angular.json`, remove `zone.js` from the build polyfills array:
```json
{
  "projects": {
    "enterprise-portal": {
      "architect": {
        "build": {
          "options": {
            "polyfills": []
          }
        }
      }
    }
  }
}
```

---

## 3. How Zoneless Renders Changes

Under zoneless execution, Angular schedules view refreshes strictly through targeted notification events:
1. Signal notifications: Writing to a signal bound to a view (`count.set(1)`).
2. Explicit `ChangeDetectorRef.markForCheck()` invocations.
3. Component template event listeners (`(click)="doSomething()"`).
4. Asynchronous pipes (`async` pipe emitting a new value).

### Deterministic View Refresh
Views that rely solely on signals are refreshed with fine-grained reactivity. Untouched subtrees are never traversed, achieving sub-millisecond DOM synchronization.

---

## 4. Zoneless Migration Checklist

When migrating existing applications to zoneless mode:

1. **Audit Mutable Properties**:
   Convert plain mutable properties bound in templates to `signal()`:
   ```typescript
   export class StatusComponent {
     readonly status = signal<string>('idle');

     updateStatus(newStatus: string): void {
       this.status.set(newStatus);
     }
   }
   ```

2. **Audit Asynchronous Callbacks**:
   If an asynchronous callback updates plain class fields rather than signals, Angular will not know a render is needed. Convert fields to signals or inject `ChangeDetectorRef`.

3. **RxJS Observable Migration**:
   Convert observables to signals using `toSignal()` from `@angular/core/rxjs-interop`:
   ```typescript
   import { Component, inject } from '@angular/core';
   import { toSignal } from '@angular/core/rxjs-interop';
   import { OrderService } from './order.service';

   @Component({
     selector: 'app-orders',
     standalone: true,
     template: `
       @for (order of orders(); track order.id) {
         <div>Order: {{ order.id }}</div>
       }
     `
   })
   export class OrdersComponent {
     private readonly orderService = inject(OrderService);
     readonly orders = toSignal(this.orderService.getOrders(), { initialValue: [] });
   }
   ```
