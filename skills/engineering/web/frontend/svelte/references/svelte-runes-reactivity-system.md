# Svelte 5 Runes Reactivity System

A specification of Svelte 5 compile-time Runes: `$state`, `$derived`, `$derived.by`, `$effect`, `$props`, and `$bindable`.

---

## 1. Local Reactive State: `$state()`

`$state()` declares reactive state powered by fine-grained signals:

```svelte
<script lang="ts">
interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
}

let count = $state(0);
let preferences = $state<UserPreferences>({
  theme: 'light',
  notifications: true
});

function increment(): void {
  count += 1;
}

function toggleTheme(): void {
  preferences.theme = preferences.theme === 'light' ? 'dark' : 'light';
}
</script>

<button onclick={increment}>Count: {count}</button>
<button onclick={toggleTheme}>Theme: {preferences.theme}</button>
```

---

## 2. Pure Derived State: `$derived()` and `$derived.by()`

`$derived()` creates a cached, read-only reactive value that updates lazily when its synchronous dependencies change. Dependencies read asynchronously (after `await` or inside `setTimeout`) are not tracked, and `$derived` callbacks must never mutate `$state` (`state_unsafe_mutation`).

### Single Expression Derivation
```svelte
<script lang="ts">
let items = $state<number[]>([10, 20, 30]);
let total = $derived(items.reduce((sum, n) => sum + n, 0));
</script>

<p>Total: {total}</p>
```

### Multi-Statement Derivation: `$derived.by()`
```svelte
<script lang="ts">
let rawScores = $state<number[]>([85, 92, 78, 95]);

let medianScore = $derived.by(() => {
  if (rawScores.length === 0) return 0;
  const sorted = [...rawScores].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
});
</script>
```

---

## 3. Side Effects: `$effect()`

`$effect()` runs **only in the browser** (never during SSR) after DOM updates whenever synchronously tracked reactive dependencies change. Always cancel timers and in-flight requests in the returned teardown function:

```svelte
<script lang="ts">
let searchInput = $state('');

$effect(() => {
  const current = searchInput.trim();
  if (!current) return;

  const controller = new AbortController();
  const timer = setTimeout(() => {
    fetch(`/api/search?q=${encodeURIComponent(current)}`, {
      signal: controller.signal
    }).catch(() => {});
  }, 300);

  return () => {
    clearTimeout(timer);
    controller.abort();
  };
});
</script>
```

### Specialized Effect Variants
- `$effect.pre()`: Runs before DOM updates; use for measuring layout or preserving scroll offset prior to paint.
- `$effect.root()`: Creates an untied, manual effect scope with an explicit cleanup function (useful outside components or in tests).
- `$effect.tracking()`: Returns `true` when executing inside a reactive tracking context.

---

## 4. Component Input Properties: `$props()` and `$bindable()`

Annotate props on the destructured variable pattern (`let { ... }: Props = $props()`). Use `$bindable()` only for props that explicitly support two-way `bind:prop` synchronization; without `$bindable()`, mutating a prop triggers `ownership_invalid_mutation`:

```svelte
<script lang="ts">
interface CardProps {
  title: string;
  subtitle?: string;
  isOpen?: boolean;
}

let {
  title,
  subtitle = 'Default Subtitle',
  isOpen = $bindable(false)
}: CardProps = $props();

function toggle(): void {
  isOpen = !isOpen;
}
</script>

<div class="card">
  <h3>{title}</h3>
  <p>{subtitle}</p>
  <button type="button" onclick={toggle}>{isOpen ? 'Collapse' : 'Expand'}</button>
</div>
```
