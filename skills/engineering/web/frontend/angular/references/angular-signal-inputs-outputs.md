# Angular 19 Signal Inputs, Outputs, and Queries

Complete guide to Angular 19 functional signal-based component boundaries and DOM queries.

---

## 1. Functional Signal Inputs: `input()`

Signal inputs replace the legacy `@Input()` decorator with read-only signals.

### Declaration and Required Inputs
```typescript
import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-user-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
import { Component, ChangeDetectionStrategy, input, booleanAttribute, numberAttribute } from '@angular/core';

@Component({
  selector: 'app-metric-gauge',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
import { Component, ChangeDetectionStrategy, output } from '@angular/core';

@Component({
  selector: 'app-delete-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<button type="button" (click)="handleDelete()">Delete</button>`
})
export class DeleteButtonComponent {
  readonly deleted = output<string>();

  handleDelete(): void {
    this.deleted.emit('item_42');
  }
}
```

### Emitting from Observables
Interoperate with RxJS streams using `outputFromObservable` (guard browser globals for SSR safety):
```typescript
import { Component, ChangeDetectionStrategy, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { EMPTY, fromEvent } from 'rxjs';

@Component({
  selector: 'app-window-tracker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div>Tracking resize events</div>`
})
export class WindowTrackerComponent {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly windowResized = outputFromObservable(
    this.isBrowser ? fromEvent(window, 'resize') : EMPTY
  );
}
```

---

## 3. Two-Way State Synchronization: `model()`

`model()` creates a writable signal input that automatically emits changes back to parents using standard two-way binding syntax `[(property)]`.

```typescript
import { Component, ChangeDetectionStrategy, model } from '@angular/core';

@Component({
  selector: 'app-toggle-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" (click)="toggle()">
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
import { Component, ChangeDetectionStrategy, ElementRef, viewChild } from '@angular/core';

@Component({
  selector: 'app-form-focus',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <input #usernameInput type="text" placeholder="Username" />
    <button type="button" (click)="focusInput()">Focus</button>
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
