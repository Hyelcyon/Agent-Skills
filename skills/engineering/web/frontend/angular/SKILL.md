---
name: angular
description: Use when building, refactoring, or optimizing Angular applications, authoring Angular 19 Standalone Components, implementing Signals-first reactivity, configuring zoneless change detection, or using modern control flow (@defer).
---

# Enterprise Angular 19 Architecture & Agent Operational Runbook

Senior engineering standards for modern Angular 19+ applications: Standalone Components, Signals-first reactivity, zoneless change detection, modern block control flow (`@if`, `@for`, `@defer`), and functional dependency injection.

## When to Use
- Authoring modern Angular components using Standalone APIs (`standalone: true`).
- Managing reactive component state via `signal()`, `computed()`, and `effect()`.
- Binding inputs and outputs using functional Signal APIs (`input()`, `output()`, `model()`).
- Code-splitting heavy component subtrees via `@defer (on viewport)`.
- Eliminating Zone.js runtime overhead via zoneless change detection.

## When NOT to Use
- Managing plain JavaScript/TypeScript classes without Angular framework bindings (use `typescript`).
- Building React or Vue applications (use `react` or `vue`).

---

## 1. Autonomous Agent Operational Protocol

When developing or refactoring Angular components, the agent must execute these 5 sequential phases:

```
[Phase 1: Standalone Audit] ──> [Phase 2: Signal State Mapping] ──> [Phase 3: Control Flow Migration] ──> [Phase 4: DI Modernization] ──> [Phase 5: Zoneless Verification]
   Standalone by default           Replace decorators with input()     Convert *ngIf to @if/@defer           Use inject() over constructor       Verify zero Zone.js leaks
```

### Phase 1: Standalone Component Architecture
1. All components, directives, and pipes are standalone by default in Angular 19. Do not add redundant `standalone: true`. (Only specify `standalone: false` if explicitly declaring inside a legacy `NgModule`).
2. Do not declare or import into legacy `NgModule` containers. Import required components directly in the `imports` array.

### Phase 2: Signal State Mapping
1. Replace legacy `@Input()` decorators with `input()` or `input.required()`.
2. Replace `@Output()` with `output()`.
3. Use `model()` for two-way bindings.
4. Replace internal mutable state with `signal()`, and derived state with `computed()`.

### Phase 3: Built-in Control Flow & Deferral
1. Never use legacy structural directives (`*ngIf`, `*ngFor`, `*ngSwitch`).
2. Use native block syntax: `@if`, `@for (item of items(); track item.id)`, and `@switch`.
3. Wrap non-critical or below-the-fold components in `@defer (on viewport; prefetch on idle)`.

### Phase 4: Functional Dependency Injection
1. Replace constructor parameter injection with functional `inject(ServiceToken)`.
2. Keep class constructors clean of dependency initialization side effects.

### Phase 5: Zoneless & OnPush Verification
1. Ensure the component uses `ChangeDetectionStrategy.OnPush`.
2. Convert any consumed RxJS streams to signals using `toSignal()` rather than calling `.subscribe()` manually.

---

## 2. Critical Anti-Patterns to Avoid
- ❌ Creating or editing `NgModule` definitions in new features (Angular is standalone-first).
- ❌ Calling `.subscribe()` inside components without automatic cleanup (causes memory leaks).
- ❌ Leaving components on default change detection with Zone.js (causes full-tree dirty checking).
- ❌ Mutating signal contents in-place (`sig().push()`) instead of using `.update()`.

## References & Resources
- Signals-First Reactivity: [references/angular-signals-first-reactivity.md](./references/angular-signals-first-reactivity.md)
- Zoneless Change Detection: [references/angular-zoneless-change-detection.md](./references/angular-zoneless-change-detection.md)
- Standalone Components: [references/angular-standalone-components.md](./references/angular-standalone-components.md)
- Signal Inputs, Outputs & Queries: [references/angular-signal-inputs-outputs.md](./references/angular-signal-inputs-outputs.md)
- Built-in Control Flow & Defer: [references/angular-modern-control-flow-defer.md](./references/angular-modern-control-flow-defer.md)
- Functional DI & `inject()`: [references/angular-functional-di-and-inject.md](./references/angular-functional-di-and-inject.md)
- Performance Profiling & Anti-Patterns: [references/angular-performance-and-antipatterns.md](./references/angular-performance-and-antipatterns.md)
- Angular Config Starter: [resources/angular-config.json](./resources/angular-config.json)
- Strict Angular TypeScript Config: [resources/tsconfig-angular.json](./resources/tsconfig-angular.json)
- Zoneless Application Bootstrap Config: [resources/zoneless-app-config.ts](./resources/zoneless-app-config.ts)
- Standalone Signal Counter Example: [examples/signal_counter_component.ts](./examples/signal_counter_component.ts)
- Deferrable Analytics Widget Example: [examples/deferrable_analytics_widget.ts](./examples/deferrable_analytics_widget.ts)
- Functional Auth Interceptor Example: [examples/functional_auth_interceptor.ts](./examples/functional_auth_interceptor.ts)
