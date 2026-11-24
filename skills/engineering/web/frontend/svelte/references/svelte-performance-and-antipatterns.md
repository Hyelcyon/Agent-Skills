# Svelte 5 Performance Optimization and Anti-Patterns

A technical guide to Svelte 5 compiler performance characteristics, memory profiling, and the Top 10 architectural anti-patterns.

---

## 1. Zero-Virtual-DOM Compilation Advantages

Svelte 5 compiles templates into direct, fine-grained DOM operations:
- **No Virtual DOM Diffing**: Unlike React, Svelte does not allocate virtual DOM trees or perform tree reconciliations on state change.
- **Surgical Signal Wiring**: When `$state` changes, only the exact DOM text node or attribute binding registered to that signal is updated directly.
- **Minimal Bundle Footprint**: Component runtime logic is reduced to minimal signal-graph listeners.

---

## 2. Memory & Snapshot Optimization

### Selective Use of `$state.raw()`
For high-frequency or large collections (e.g. data grids, charting series, large API payloads), avoid deep proxy wrapping by utilizing `$state.raw()`:

```svelte
<script lang="ts">
let records = $state.raw<Array<{ id: string; metric: number }>>([]);

function loadBatch(newRecords: Array<{ id: string; metric: number }>): void {
  records = newRecords;
}
</script>
```

### Minimizing `$state.snapshot()` Invocations
`$state.snapshot()` performs a recursive deep clone of reactive proxies. Avoid calling it inside animation loops, render loops, or high-frequency event handlers.

---

## 3. Top 10 Svelte Anti-Patterns

### 1. Using Legacy `$:` Label Statements
- ❌ **Anti-Pattern**: Using Svelte 3/4 reactive labels (`$: countDouble = count * 2`).
- ✅ **The Senior Fix**: Use `$derived()` for calculations and `$effect()` for side effects.

### 2. Using `export let` for Props
- ❌ **Anti-Pattern**: Declaring component props via `export let`.
- ✅ **The Senior Fix**: Always use `let { propName } = $props()`.

### 3. Mutating `$state` Inside `$effect()`
- ❌ **Anti-Pattern**: Reading state A and updating state B inside an `$effect`, causing infinite render loops:
  ```svelte
  $effect(() => {
    fullName = `${firstName} ${lastName}`;
  });
  ```
- ✅ **The Senior Fix**: Compute derived state synchronously:
  ```svelte
  let fullName = $derived(`${firstName} ${lastName}`);
  ```

### 4. Using `<slot />` Instead of Snippets
- ❌ **Anti-Pattern**: Using legacy slots which lack TypeScript type safety and parameterized arguments.
- ✅ **The Senior Fix**: Use `{#snippet}` and `{@render}`.

### 5. Overusing Deep Proxy `$state` for Huge Datasets
- ❌ **Anti-Pattern**: Putting massive 100,000-element arrays into `$state()` when internal items are never modified individually.
- ✅ **The Senior Fix**: Wrap large monolithic datasets in `$state.raw()`.

### 6. Forgetting Resource Cleanup in `$effect()`
- ❌ **Anti-Pattern**: Setting up browser event listeners, WebSockets, or timers without returning a teardown function.
- ✅ **The Senior Fix**: Return a cleanup callback from `$effect()`:
  ```svelte
  $effect(() => {
    const handle = setInterval(tick, 1000);
    return () => clearInterval(handle);
  });
  ```

### 7. Attempting to Mutate `$derived` Values
- ❌ **Anti-Pattern**: Trying to assign to a `$derived` variable (`doubled += 1`).
- ✅ **The Senior Fix**: Derived values are strictly read-only. Mutate the source `$state` variable instead.

### 8. Creating Redundant Svelte Stores
- ❌ **Anti-Pattern**: Creating `writable()` or `readable()` stores for simple component state.
- ✅ **The Senior Fix**: Use `$state()` inside components or `.svelte.ts` files.

### 9. Omitting Key Expressions in `{#each}` Loops
- ❌ **Anti-Pattern**: Writing `{#each items as item}` without specifying a unique key `(item.id)`.
- ✅ **The Senior Fix**: Always provide a unique tracking key: `{#each items as item (item.id)}`.

### 10. Deep Prop Drilling
- ❌ **Anti-Pattern**: Passing props down through 5+ component layers.
- ✅ **The Senior Fix**: Use Svelte's context API (`setContext` / `getContext`) or an exported stateful class from a `.svelte.ts` module.
