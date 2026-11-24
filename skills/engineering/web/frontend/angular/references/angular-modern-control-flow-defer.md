# Angular 19 Built-in Control Flow and Deferrable Views

Engineering runbook for Angular 19 native block control flow (`@if`, `@for`, `@switch`) and declarative code-splitting via `@defer`.

---

## 1. Built-in Control Flow vs Legacy Directives

Angular 19 eliminates structural directives (`*ngIf`, `*ngFor`, `*ngSwitch`) in favor of native template block syntax:
- 0 KB bundle weight for control flow (built directly into template compiler).
- Better type narrowing within template scopes.
- Clearer nested branching and elimination of unnecessary container elements (`<ng-container>`).

---

## 2. Conditional Rendering: `@if`

Type-narrowing and conditional rendering:

```html
@if (user(); as currentUser) {
  <div class="user-card">
    <h2>{{ currentUser.name }}</h2>
    <p>Role: {{ currentUser.role }}</p>
  </div>
} @else if (isLoading()) {
  <div class="spinner">Loading user profile...</div>
} @else {
  <div class="alert">No user session active.</div>
}
```

---

## 3. List Iteration: `@for` and Mandatory `track`

The `@for` block enforces performance-optimal DOM reconciliation via mandatory tracking keys:

```html
<ul class="task-list">
  @for (task of tasks(); track task.id; let idx = $index; let total = $count) {
    <li class="task-item">
      <span>{{ idx + 1 }}/{{ total }}: {{ task.title }}</span>
    </li>
  } @empty {
    <li class="empty-state">No tasks available in queue.</li>
  }
</ul>
```

### Context Variables Available in `@for`
- `$index`: Current 0-based index.
- `$count`: Total length of collection.
- `$first`: Boolean indicating first item.
- `$last`: Boolean indicating last item.
- `$even` / `$odd`: Parity booleans.

---

## 4. Multi-Branch Selection: `@switch`

Native pattern matching block:

```html
@switch (deliveryStatus()) {
  @case ('pending') {
    <span class="badge warning">Order Pending</span>
  }
  @case ('shipped') {
    <span class="badge info">Shipped</span>
  }
  @case ('delivered') {
    <span class="badge success">Delivered</span>
  }
  @default {
    <span class="badge muted">Status Unknown</span>
  }
}
```

---

## 5. Deferrable Views: `@defer`

`@defer` automates lazy-loading and code-splitting of components directly inside templates without requiring manual router configuration.

```html
@defer (on viewport; prefetch on idle) {
  <app-heavy-chart [data]="metricsData()" />
} @placeholder (minimum 500ms) {
  <div class="chart-skeleton">Chart will appear when scrolled into view</div>
} @loading (after 100ms; minimum 300ms) {
  <div class="chart-spinner">Loading chart module...</div>
} @error {
  <div class="chart-error">Failed to load chart module</div>
}
```

### Defer Triggers
- `on idle`: Triggers when browser reaches idle state (`requestIdleCallback`).
- `on viewport`: Triggers when placeholder enters the browser viewport (`IntersectionObserver`).
- `on interaction`: Triggers on click or focus of a target element.
- `on hover`: Triggers when mouse hovers over a target element.
- `on immediate`: Triggers immediately after initial render finishes.
- `on timer(duration)`: Triggers after specified time delay.
- `when condition`: Triggers whenever a custom reactive signal condition evaluates to true.
