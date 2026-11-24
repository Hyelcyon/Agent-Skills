# Angular 19 Functional Dependency Injection and `inject()`

Comprehensive standards for functional dependency injection, custom tokens, functional interceptors, and guards.

---

## 1. Functional Injection with `inject()`

Angular 19 mandates functional `inject()` over constructor-based parameter injection:
- Eliminates repetitive `constructor(private readonly s: Service)` parameter lists.
- Simplifies class inheritance: Subclasses do not need to repeat `super(...)` calls for parent dependencies.
- Usable inside standalone functions, composable helpers, and guards.

```typescript
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  template: `
    <header>
      <span>Welcome, {{ currentUser() }}</span>
      <button (click)="logout()">Sign Out</button>
    </header>
  `
})
export class DashboardHeaderComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.auth.user;

  logout(): void {
    this.auth.signOut();
    this.router.navigate(['/login']);
  }
}
```

---

## 2. Custom `InjectionToken` and Config Injection

Declare strongly-typed tokens with default factories:

```typescript
import { InjectionToken } from '@angular/core';

export interface ApiConfiguration {
  baseUrl: string;
  timeoutMs: number;
}

export const API_CONFIG = new InjectionToken<ApiConfiguration>('API_CONFIG', {
  providedIn: 'root',
  factory: () => ({
    baseUrl: 'https://api.enterprise.com/v1',
    timeoutMs: 5000
  })
});
```

Consuming in a service or component:
```typescript
import { Injectable, inject } from '@angular/core';
import { API_CONFIG } from './api.config';

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly config = inject(API_CONFIG);

  getBaseUrl(): string {
    return this.config.baseUrl;
  }
}
```

---

## 3. Functional HTTP Interceptors: `HttpInterceptorFn`

Class-based interceptors (`implements HttpInterceptor`) are deprecated. Use functional interceptors:

```typescript
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const auth = inject(AuthService);
  const token = auth.token();

  if (!token) {
    return next(req);
  }

  const authenticatedReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authenticatedReq);
};
```

Registering in `app.config.ts`:
```typescript
import { ApplicationConfig, provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
```

---

## 4. Functional Route Guards: `CanActivateFn`

Guards are written as standalone functions utilizing `inject()`:

```typescript
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  return router.parseUrl('/login');
};
```

---

## 5. Execution Contexts: `runInInjectionContext`

When invoking functions that call `inject()` outside standard component construction, wrap the call with `runInInjectionContext`:

```typescript
import { EnvironmentInjector, runInInjectionContext } from '@angular/core';

export function executeWithDi<T>(injector: EnvironmentInjector, fn: () => T): T {
  return runInInjectionContext(injector, fn);
}
```
