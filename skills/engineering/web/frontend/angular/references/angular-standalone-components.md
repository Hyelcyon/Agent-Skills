# Angular 19 Standalone Component Architecture

Engineering specifications for modern Angular components, directives, and pipes operating without `NgModule` containers.

---

## 1. The Standalone Architecture Principle

In Angular 19, standalone is the default mode for all components, directives, and pipes:
- No module declarations: Components declare their own dependencies explicitly via the `imports` array.
- Clear dependency graphs: Every component is self-contained and immediately auditable.
- Granular tree-shaking: Unused imports are eliminated by bundlers at the single-component level.

---

## 2. Component Declaration Standard

In Angular 19, `standalone: true` is the implicit framework default. Components do NOT need to specify `standalone: true`. List only direct dependencies in `imports`:

```typescript
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserAvatarComponent } from '../ui/user-avatar.component';
import { CurrencyFormatPipe } from '../pipes/currency-format.pipe';

@Component({
  selector: 'app-account-card',
  imports: [CommonModule, UserAvatarComponent, CurrencyFormatPipe],
  template: `
    <div class="card">
      <app-user-avatar [userId]="userId()" />
      <p>Balance: {{ balance() | currencyFormat }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountCardComponent {
  readonly userId = input.required<string>();
  readonly balance = input.required<number>();
}
```

---

## 3. Standalone Directives and Pipes

Directives and pipes follow the exact same standalone paradigm:

### Standalone Directive
```typescript
import { Directive, ElementRef, inject, OnInit } from '@angular/core';

@Directive({
  selector: '[appAutoFocus]',
  standalone: true
})
export class AutoFocusDirective implements OnInit {
  private readonly elementRef = inject(ElementRef);

  ngOnInit(): void {
    this.elementRef.nativeElement.focus();
  }
}
```

### Standalone Pipe
```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize',
  standalone: true
})
export class FileSizePipe implements PipeTransform {
  transform(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  }
}
```

---

## 4. Route-Level Lazy Loading

In a standalone routing architecture, routes lazy-load individual components directly using `loadComponent`:

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      )
  },
  {
    path: 'settings',
    loadChildren: () =>
      import('./features/settings/settings.routes').then(
        (m) => m.SETTINGS_ROUTES
      )
  }
];
```

---

## 5. Deprecation of `NgModule`

- Legacy `NgModule` is obsolete for new feature development.
- Do not create `SharedModule` or feature modules.
- When consuming third-party legacy module-based libraries, import the module directly into the standalone component's `imports` array without creating an intermediary wrapper module.
