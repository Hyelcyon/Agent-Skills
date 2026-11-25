---
name: svelte
description: Use when building, refactoring, or optimizing Svelte 5 applications, implementing Svelte 5 Runes ($state, $derived, $effect, $props, $bindable), authoring Snippets instead of slots, creating .svelte.ts reactivity modules, or migrating legacy Svelte 3/4 syntax.
---

# Enterprise Svelte 5 Architecture & Agent Operational Runbook

Senior engineering standards for modern Svelte 5+ and SvelteKit 2 web applications: the Runes reactivity system (`$state`, `$derived`, `$effect`, `$props`, `$bindable`), Snippets (`{#snippet}`, `{@render}`), `.svelte.ts` universal reactivity modules, SSR state isolation, and anti-pattern elimination.

## When to Use
- Writing or refactoring Svelte components using Svelte 5 Runes standards.
- Declaring reactive state and universal reactivity modules in `.svelte.ts` files.
- Replacing legacy `<slot />` templates with type-safe, parameterized Snippets (`{#snippet}`).
- Managing two-way prop synchronization via `$bindable()`.
- Migrating legacy Svelte 3/4 codebases (`$:`, `export let`, `on:click`, `$app/stores`) to Svelte 5 and SvelteKit 2.

## When NOT to Use
- Managing backend server databases or REST endpoint routing outside SvelteKit (use `api` or `architecture`).
- Developing React, Vue, or Angular applications (use `react`, `vue`, or `angular`).

---

## 5-Phase Agent Operational Protocol

```text
Phase 1: Legacy Reactivity Purge (Purge $:, export let, <slot>, on:event)
Phase 2: Reactive State & Typed Props ($state, $props, $bindable, SvelteMap/SvelteSet)
Phase 3: Pure Derived Calculations ($derived, $derived.by; no mutations in $effect)
Phase 4: Snippets & Universal Modules ({#snippet}, {@render}, .svelte.ts + SSR Context)
Phase 5: Effect Hygiene & Compiler Verification (AbortController cleanup, svelte-check, vitest run)
```

### Phase 1: Legacy Reactivity Purge
Eliminate Svelte 3/4 patterns (`export let` -> `$props()`, `$:` -> `$derived()` / `$effect()`, `<slot />` -> `{#snippet}` / `{@render}`, `on:click` -> `onclick`, `$app/stores` -> `$app/state`).

### Phase 2: Reactive State & Typed Props
Annotate destructured `$props()` on the binding pattern (`let { ... }: Props = $props()`), use `$bindable()` only for explicit two-way bindings, and use `SvelteMap` / `SvelteSet` from `'svelte/reactivity'` for reactive collections (native `Map`/`Set` are not proxied by `$state()`):
```svelte
<script lang="ts">
interface Props {
  maxLimit?: number;
  open?: boolean;
}
let count = $state(0);
let { maxLimit = 100, open = $bindable(false) }: Props = $props();
</script>
```

### Phase 3: Pure Derived Calculations
Never mutate `$state` inside `$effect` when the value is purely derived from other state. Use `$derived(expr)` or `$derived.by(() => { ... })` with zero side effects.

### Phase 4: Snippets & Universal `.svelte.ts` Modules
- Replace slots with typed `Snippet` props (`{@render children?.()}`) and parameterized `{#snippet itemTemplate(item)}`.
- In `.svelte.ts` files, never `export let count = $state(0)` directly (`state_invalid_export` error); expose getter/factory functions or mutate properties on an exported `const` instance.
- In SvelteKit SSR, never store per-user state in module-level `$state` singletons; instantiate per-request state via `setContext` / `getContext` in root layouts.

### Phase 5: Effect Hygiene & Verification
Use `$effect()` strictly for client-side DOM/external I/O (note `$effect` never executes during SSR) and return cleanup callbacks (`clearTimeout`, `AbortController.abort()`). Verify with non-blocking compiler and unit checks:
```bash
npx svelte-check --tsconfig ./tsconfig.json
npx vitest run
```

---

## Fatal Mistakes Never to Make

- **Never export reassigned `$state` directly from a `.svelte.ts` module**: `export let count = $state(0)` fails compilation (`state_invalid_export`); return getters/factory functions or export a `const` reactive class instance whose fields mutate.
- **Never store per-user state in top-level `.svelte.ts` module singletons during SSR**: Node.js shares module scope across concurrent users, leaking private data between requests; isolate state per request with `setContext`/`getContext`.
- **Never wrap native `Map`, `Set`, or `Date` in `$state()` expecting deep reactivity**: `$state()` only deeply proxies plain objects and arrays; import `SvelteMap`, `SvelteSet`, and `SvelteDate` from `'svelte/reactivity'`.
- **Never mix legacy `export let`, `$:`, `<slot />`, or `on:event` into Runes components**: Mixing triggers legacy compatibility errors or silent syntax failures.
- **Never use `throw error(...)` or `throw redirect(...)` in SvelteKit 2**: Both throw internally and return `never` (`error(404, 'Not found')`); also migrate `$app/stores` to `$app/state`.
- **Never set Svelte 4 `immutable: true` in Svelte 5 config**: `immutable` is ignored in Runes mode.

---

## References & Resources
- Runes Reactivity System: [references/svelte-runes-reactivity-system.md](./references/svelte-runes-reactivity-system.md)
- Snippets & Templating: [references/svelte-snippets-and-templating.md](./references/svelte-snippets-and-templating.md)
- Deep State & Reactive Proxies: [references/svelte-deep-state-and-proxies.md](./references/svelte-deep-state-and-proxies.md)
- Universal Reactivity Modules: [references/svelte-universal-reactivity-modules.md](./references/svelte-universal-reactivity-modules.md)
- Stores & Legacy Migration: [references/svelte-stores-migration-guide.md](./references/svelte-stores-migration-guide.md)
- SvelteKit 2 Full-Stack Architecture: [references/sveltekit-server-and-routing.md](./references/sveltekit-server-and-routing.md)
- Performance Profiling & Anti-Patterns: [references/svelte-performance-and-antipatterns.md](./references/svelte-performance-and-antipatterns.md)
- Svelte 5 Compiler Presets: [resources/svelte-config.json](./resources/svelte-config.json)
- SvelteKit Strict TypeScript Config: [resources/tsconfig-svelte.json](./resources/tsconfig-svelte.json)
- Svelte Preprocessor Config: [resources/svelte.config.js](./resources/svelte.config.js)
- Universal Counter Rune Model: [examples/counter_rune.svelte.ts](./examples/counter_rune.svelte.ts)
- Snippet List Dialog Example: [examples/snippet_list_dialog.svelte](./examples/snippet_list_dialog.svelte)
- State Snapshot & Raw Buffer Example: [examples/state_snapshot_clone.svelte.ts](./examples/state_snapshot_clone.svelte.ts)
