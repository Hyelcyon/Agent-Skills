# Svelte 5 Performance Optimization and Anti-Patterns

A technical guide to Svelte 5 compiler performance characteristics, memory optimization, and eliminating the Top 10 architectural anti-patterns.

---

## 1. Zero-Virtual-DOM Compilation Advantages

Svelte 5 compiles templates into direct, fine-grained DOM operations:
- **No Virtual DOM Diffing**: State mutations do not allocate intermediate VNode trees or diff full component subtrees.
- **Surgical Signal Wiring**: Only the exact text node, attribute, or block linked to a changed `$state` signal updates.
- **Minimal Bundle Footprint**: Component logic compiles down to lean signal-graph subscriptions.

---

## 2. Memory & Snapshot Optimization

### Selective Use of `$state.raw()`
For large read-only tables, charting series, or WebGL buffers where nested fields are never mutated individually, avoid deep proxy wrapping with `$state.raw()`:

```svelte
<script lang="ts">
let records = $state.raw<Array<{ id: string; metric: number }>>([]);

function loadBatch(newRecords: Array<{ id: string; metric: number }>): void {
  records = newRecords;
}
</script>
```

### Minimizing `$state.snapshot()` Invocations
`$state.snapshot()` performs a recursive deep clone of reactive proxies. Avoid calling it inside animation loops or high-frequency scroll/pointer handlers.

---

## 3. Top 10 Svelte 5 Anti-Patterns

### 1. Using Legacy `$:` Label Statements
- ❌ **Anti-Pattern**: Svelte 3/4 reactive labels (`$: countDouble = count * 2`).
- ✅ **Senior Fix**: Use `$derived()` for computed values and `$effect()` strictly for DOM/external side effects.

### 2. Using `export let` or Legacy `on:event` Directives
- ❌ **Anti-Pattern**: `export let prop` or `<button on:click={fn}>`.
- ✅ **Senior Fix**: Use `let { prop }: Props = $props()` and standard attribute handlers `onclick={fn}`.

### 3. Mutating `$state` Inside `$effect()` or `$derived()`
- ❌ **Anti-Pattern**: Computing derived state inside `$effect(() => { fullName = ... })` (triggers extra render cycles) or mutating state inside `$derived` (throws `state_unsafe_mutation`).
- ✅ **Senior Fix**: `let fullName = $derived(`${firstName} ${lastName}`);`.

### 4. Using `<slot />` Instead of Snippets
- ❌ **Anti-Pattern**: Legacy `<slot />` which lacks TypeScript parameter typing.
- ✅ **Senior Fix**: Use `{#snippet}` and `{@render}`.

### 5. Wrapping `Map`, `Set`, or Huge Immutable Arrays in `$state()`
- ❌ **Anti-Pattern**: Expecting `$state(new Map())` to react to `.set()`, or deeply proxying 100k-row static arrays.
- ✅ **Senior Fix**: Use `SvelteMap` / `SvelteSet` from `'svelte/reactivity'` for reactive collections and `$state.raw()` for large immutable arrays.

### 6. Forgetting Resource Cleanup in `$effect()`
- ❌ **Anti-Pattern**: Creating timers, `fetch`, WebSockets, or event listeners without teardown.
- ✅ **Senior Fix**: Return a cleanup callback clearing timers and calling `controller.abort()`.

### 7. Exporting Reassigned `$state` Directly from `.svelte.ts`
- ❌ **Anti-Pattern**: `export let count = $state(0);` (`state_invalid_export` compiler error).
- ✅ **Senior Fix**: Export factory/getter functions or mutate fields on an exported `const` instance.

### 8. Module-Level Singletons in SvelteKit SSR
- ❌ **Anti-Pattern**: `export const session = new UserState()` at module scope on the server (leaks data across concurrent users).
- ✅ **Senior Fix**: Instantiate per-request state via `setContext` / `getContext` in root `+layout.svelte`.

### 9. Omitting Key Expressions in `{#each}` Loops
- ❌ **Anti-Pattern**: Writing `{#each items as item}` without a unique key.
- ✅ **Senior Fix**: Always key dynamic lists by stable ID: `{#each items as item (item.id)}`.

### 10. Deep Prop Drilling
- ❌ **Anti-Pattern**: Threading props manually through 5+ component layers.
- ✅ **Senior Fix**: Pass a `.svelte.ts` reactive class instance through `setContext` / `getContext`.
