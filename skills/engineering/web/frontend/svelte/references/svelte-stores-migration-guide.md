# Svelte 5 Stores and Legacy Migration Guide

A migration guide for transitioning legacy Svelte 3/4 reactive statements (`$:`, `export let`, stores) to Svelte 5 Runes.

---

## 1. Why Runes Supersede Svelte Stores

In Svelte 3 and 4, cross-component reactive state required `svelte/store` (`writable`, `readable`, `derived`) and the `$` auto-subscription prefix:
- Stores forced explicit `.subscribe()`, `.set()`, `.update()` boilerplate outside components.
- The `$` auto-subscription prefix worked only inside `.svelte` Single File Components.
- In Svelte 5, `$state` works universally in both `.svelte` and `.svelte.ts` files, eliminating the need for store wrappers.

---

## 2. Syntax Migration Table

| Legacy Svelte 3/4 Syntax | Modern Svelte 5 Runes Equivalent |
|---|---|
| `let count = 0;` (reactive inside component) | `let count = $state(0);` |
| `export let title: string;` | `let { title }: { title: string } = $props();` |
| `export let optional = 'default';` | `let { optional = 'default' } = $props();` |
| `$: doubled = count * 2;` | `let doubled = $derived(count * 2);` |
| `$: { console.log(count); }` | `$effect(() => { console.log(count); });` |
| `<slot />` | `{@render children()}` |
| `<slot name="header" />` | `{@render header()}` |
| `writable(0)` | `$state(0)` inside `.svelte.ts` |
| `derived(store, ($s) => $s.val)` | `get val() { return this.state.val; }` |

---

## 3. Step-by-Step Codebase Refactoring

### Step 1: Migrate Component Props
Legacy Svelte 4:
```svelte
// ❌ Legacy Svelte 3/4 Anti-Pattern:
<script lang="ts">
export let userName: string;
export let userAge = 18;
</script>
```

Svelte 5 Runes:
```svelte
<script lang="ts">
interface UserProps {
  userName: string;
  userAge?: number;
}

let { userName, userAge = 18 }: UserProps = $props();
</script>
```

### Step 2: Migrate Reactive Statements
Legacy Svelte 4:
```svelte
// ❌ Legacy Svelte 3/4 Anti-Pattern:
<script lang="ts">
let query = '';
$: filteredList = allItems.filter((i) => i.name.includes(query));
$: if (query.length > 5) {
  fetchAnalytics(query);
}
</script>
```

Svelte 5 Runes:
```svelte
<script lang="ts">
let query = $state('');
let filteredList = $derived(allItems.filter((i) => i.name.includes(query)));

$effect(() => {
  if (query.length > 5) {
    fetchAnalytics(query);
  }
});
</script>
```

### Step 3: Interoperating with Third-Party Stores
If consuming an external library that returns a Svelte store (`Readable<T>`), you can still read it using the `$` prefix inside `.svelte` components:

```svelte
<script lang="ts">
import { page } from '$app/stores';

let currentRoute = $derived($page.url.pathname);
</script>
```
