# Svelte 5 Runes Reactivity System

A comprehensive specification of the Svelte 5 compile-time Runes: `$state`, `$derived`, `$effect`, `$props`, and `$bindable`.

---

## 1. Local and Shared Reactive State: `$state()`

`$state()` declares deeply reactive state powered by fine-grained signals.

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

`$derived()` creates a cached, read-only reactive value that updates automatically when its dependencies change.

### Single Expression Derivation
```svelte
<script lang="ts">
let items = $state<number[]>([10, 20, 30]);
let total = $derived(items.reduce((sum, n) => sum + n, 0));
</script>

<p>Total: {total}</p>
```

### Multi-Statement Derivation: `$derived.by()`
Use `$derived.by()` when the calculation requires branching or local variables:
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

`$effect()` runs after the DOM updates whenever one or more tracked state dependencies change.

```svelte
<script lang="ts">
let searchInput = $state('');

$effect(() => {
  const current = searchInput;
  const timer = setTimeout(() => {
    fetch(`/api/search?q=${encodeURIComponent(current)}`);
  }, 300);

  return () => {
    clearTimeout(timer);
  };
});
</script>
```

### Specialized Effect Variants
- `$effect.pre()`: Runs before the DOM is updated. Use for synchronizing scroll positions before layout paint.
- `$effect.root()`: Creates an isolated, non-tracked effect root for manual lifecycle tearing.

---

## 4. Component Input Properties: `$props()` and `$bindable()`

`$props()` replaces legacy `export let`:

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
  <button onclick={toggle}>{isOpen ? 'Collapse' : 'Expand'}</button>
</div>
```

`$bindable()` explicitly grants parent components permission to establish two-way `bind:isOpen` synchronization.
