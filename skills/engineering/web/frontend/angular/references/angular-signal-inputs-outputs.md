# Angular 19 Signal Inputs, Outputs, and Queries

Complete guide to Angular 19 functional signal-based component boundaries and DOM queries.

---

## 1. Functional Signal Inputs: `input()`

Signal inputs replace the legacy `@Input()` decorator with read-only signals.

### Declaration and Required Inputs
```typescript
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-user-badge',
  standalone: true,
  template: `
    <div class="badge">
      <span>{{ name() }}</span>
      @if (badgeRole()) {
        <em>({{ badgeRole() }})</em>
      }
    </div>
  `
})
export class UserBadgeComponent {
  readonly name = input.required<string>();
  readonly badgeRole = input<string>('Guest');
}
```

### Input Transforms
Use the `transform` property to parse or sanitize incoming values cleanly:
```typescript
import { Component, input, booleanAttribute, numberAttribute } from '@angular/core';

@Component({
  selector: 'app-metric-gauge',
  standalone: true,
  template: `<div>Value: {{ value() }} | Disabled: {{ isDisabled() }}</div>`
})
export class MetricGaugeComponent {
  readonly value = input(0, { transform: numberAttribute });
  readonly isDisabled = input(false, { transform: booleanAttribute });
}
```

---

## 2. Functional Outputs: `output()`

Outputs notify parent components of events without the overhead of `EventEmitter`.

### Declaration and Emission
```typescript
import { Component, output } from '@angular/core';

@Component({
  selector: 'app-delete-button',
  standalone: true,
  template: `<button (click)="handleDelete()">Delete</button>`
})
export class DeleteButtonComponent {
  readonly deleted = output<string>();

  handleDelete(): void {
    this.deleted.emit('item_42');
  }
}
```

### Emitting from Observables
Interoperate with RxJS streams using `outputFromObservable`:
```typescript
import { Component } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';

@Component({
  selector: 'app-window-tracker',
  standalone: true,
  template: `<div>Tracking resize events</div>`
})
export class WindowTrackerComponent {
  readonly windowResized = outputFromObservable(fromEvent(window, 'resize'));
}
```

---

## 3. Two-Way State Synchronization: `model()`

`model()` creates a writable signal input that automatically emits changes back to parents using standard two-way binding syntax `[(property)]`.

```typescript
import { Component, model } from '@angular/core';

@Component({
  selector: 'app-toggle-switch',
  standalone: true,
  template: `
    <button (click)="toggle()">
      {{ enabled() ? 'Active' : 'Inactive' }}
    </button>
  `
})
export class ToggleSwitchComponent {
  readonly enabled = model<boolean>(false);

  toggle(): void {
    this.enabled.update((current) => !current);
  }
}
```

Usage in parent template:
```html
<app-toggle-switch [(enabled)]="isFeatureActive" />
```

---

## 4. Signal Queries: `viewChild` and `contentChild`

Signal queries replace `@ViewChild` and `@ContentChild` with reactive signals that update automatically when the DOM updates.

```typescript
import { Component, ElementRef, viewChild, viewChildren, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-form-focus',
  standalone: true,
  template: `
    <input #usernameInput type="text" placeholder="Username" />
    <button (click)="focusInput()">Focus</button>
  `
})
export class FormFocusComponent {
  readonly usernameInput = viewChild.required<ElementRef<HTMLInputElement>>('usernameInput');

  focusInput(): void {
    this.usernameInput().nativeElement.focus();
  }
}
```

### Signal Queries Advantages
- Return types are signals: `Signal<ElementRef | undefined>` or `Signal<ElementRef>`.
- Fully reactive: Can be consumed directly within `computed()` or `effect()`.
- No lifecycle synchronization bugs: Signals update synchronously with view creation.
