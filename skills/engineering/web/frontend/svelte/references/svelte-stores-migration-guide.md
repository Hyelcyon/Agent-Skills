# Svelte 5 Stores and Legacy Migration Guide

A migration guide for transitioning legacy Svelte 3/4 reactive syntax (`$:`, `export let`, `on:event`, `<slot />`, `svelte/store`, `$app/stores`) to Svelte 5 Runes and SvelteKit 2 `$app/state`.

---

## 1. Why Runes Supersede Svelte Stores

In Svelte 3 and 4, shared reactive state required `svelte/store` (`writable`, `readable`, `derived`) and the `$` auto-subscription prefix that only worked inside `.svelte` files. In Svelte 5, `$state` and `$derived` work identically inside `.svelte` components and `.svelte.ts` modules, eliminating `.subscribe()` boilerplate.

---

## 2. Syntax Migration Table

| Legacy Svelte 3/4 Syntax | Modern Svelte 5 Runes Equivalent |
|---|---|
| `let count = 0;` (reactive top-level) | `let count = $state(0);` |
| `export let title: string;` | `let { title }: { title: string } = $props();` |
| `export let optional = 'default';` | `let { optional = 'default' }: { optional?: string } = $props();` |
| `$: doubled = count * 2;` | `let doubled = $derived(count * 2);` |
| `$: { console.log(count); }` | `$effect(() => { console.log(count); });` |
| `beforeUpdate(...)` / `afterUpdate(...)` | `$effect.pre(...)` / `$effect(...)` |
| `on:click={handler}` | `onclick={handler}` |
| `createEventDispatcher()` | Callback props (`let { onSave }: Props = $props();`) |
| `<slot />` / `<slot name="header" />` | `{@render children?.()}` / `{@render header?.()}` |
| `writable(0)` in shared store | `$state(0)` inside `.svelte.ts` class or factory + Context |
| `derived(store, ($s) => $s.val)` | `val = $derived(state.val);` |
| `import { page } from '$app/stores'` (`$page`) | `import { page } from '$app/state'` (`page`) |

---

## 3. Step-by-Step Codebase Refactoring

### Step 1: Migrate Component Props & Events
Legacy Svelte 4:
```svelte
// Legacy Svelte 3/4 Anti-Pattern:
<script lang="ts">
export let userName: string;
export let userAge = 18;
</script>
<button on:click={() => console.log(userName)}>Save</button>
```

Svelte 5 Runes:
```svelte
<script lang="ts">
interface UserProps {
  userName: string;
  userAge?: number;
  onSave?: (name: string) => void;
}

let { userName, userAge = 18, onSave }: UserProps = $props();
</script>

<button type="button" onclick={() => onSave?.(userName)}>
  Save ({userAge})
</button>
```

### Step 2: Migrate Reactive Statements
Legacy Svelte 4:
```svelte
// Legacy Svelte 3/4 Anti-Pattern:
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
let { allItems }: { allItems: Array<{ name: string }> } = $props();
let query = $state('');
let filteredList = $derived(allItems.filter((i) => i.name.includes(query)));

$effect(() => {
  if (query.length > 5) {
    fetchAnalytics(query);
  }
});
</script>
```

### Step 3: SvelteKit `$app/state` & Third-Party Stores
In SvelteKit 2.12+, import `page`, `navigating`, and `updated` from **`$app/state`** (reactive Rune objects read without `$`) instead of deprecated `$app/stores`:
```svelte
<script lang="ts">
import { page } from '$app/state';

let currentRoute = $derived(page.url.pathname);
</script>
```

When consuming a third-party `Readable<T>` store, auto-subscribe with `$store` inside `.svelte` templates or bridge it with `fromStore()` from `'svelte/store'` inside `.svelte.ts` modules.
