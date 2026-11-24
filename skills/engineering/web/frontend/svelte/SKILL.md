---
name: svelte
description: Use when building, refactoring, or optimizing Svelte applications, implementing Svelte 5 Runes ($state, $derived, $effect, $props), authoring Snippets instead of slots, or eliminating legacy Svelte 3/4 reactive syntax.
---

# Enterprise Svelte 5 Architecture & Agent Operational Runbook

Senior engineering standards for modern Svelte 5+ web applications: the Runes reactivity system (`$state`, `$derived`, `$effect`, `$props`), Snippets (`{#snippet}`), zero-runtime compilation, and anti-pattern elimination.

## When to Use
- Writing or refactoring Svelte components using Svelte 5 Runes standards.
- Declaring reactive state and universal reactivity modules in `.svelte.ts` files.
- Replacing legacy `<slot />` templates with type-safe, parameterized Snippets (`{#snippet}`).
- Managing two-way prop synchronization via `$bindable()`.
- Migrating legacy Svelte 3/4 codebases (`$:`, `export let`) to modern Svelte 5 Runes.

## When NOT to Use
- Managing backend server databases or REST endpoint routing (use `api` or `architecture`).
- Developing React, Vue, or Angular applications (use `react`, `vue`, or `angular`).

---

## 1. Autonomous Agent Operational Protocol

When developing or refactoring Svelte components, the agent must execute these 6 sequential phases:

```
[Phase 1: Runes Audit] ──> [Phase 2: State Declaration] ──> [Phase 3: Derived Calculation] ──> [Phase 4: Snippet Templating] ──> [Phase 5: Effect Hygiene] ──> [Phase 6: Verification]
   Purge $: and export let     Declare $state & $props         Use $derived for computations     Replace <slot> with {#snippet}   Restrict $effect to DOM/IO      svelte-check & test
```

### Phase 1: Legacy Reactivity Purge
1. Identify and eliminate legacy Svelte 3/4 syntax:
   - Replace `export let propName` with `let { propName } = $props();`.
   - Replace `$: doubled = count * 2` with `let doubled = $derived(count * 2);`.
   - Replace `$: { ... }` side-effect blocks with `$effect(() => { ... });`.

### Phase 2: Reactive State & Prop Declaration
1. Use `$state()` for local component variables and arrays:
   ```svelte
   <script lang="ts">
   let count = $state(0);
   let { maxLimit = 100 } = $props<{ maxLimit?: number }>();
   </script>
   ```
2. Mutate `$state` arrays directly (`items.push(item)`); the compiler automatically tracks in-place mutations.

### Phase 3: Derived Calculations
1. Never update state inside an effect when the value depends purely on other state.
2. Always calculate derived values using `$derived()` or `$derived.by(() => { ... })`.

### Phase 4: Snippets Over Slots
1. Replace legacy `<slot />` declarations with parameterized Snippets:
   ```svelte
   {#snippet itemTemplate(item: string)}
     <li class="item">{item}</li>
   {/snippet}

   <ul>
     {#each items as item}
       {@render itemTemplate(item)}
     {/each}
   </ul>
   ```

### Phase 5: Effect Hygiene & Resource Cleanup
1. Use `$effect()` strictly for browser DOM integrations, timer setups, or external subscriptions.
2. Always return a cleanup function from `$effect()` when setting up timers or event listeners.

### Phase 6: Verification & Quality Gate
1. Execute the Svelte compiler type check and ensure zero diagnostic errors:
   ```bash
   npx svelte-check --tsconfig ./tsconfig.json
   ```
2. Run automated component unit tests and verify reactive state bindings:
   ```bash
   npm test
   ```
3. Confirm zero legacy compiler warnings (`legacy-mode` or `$:` syntax deprecations).

---

## 2. Critical Anti-Patterns to Avoid
- ❌ Using legacy `export let` or `$:` syntax (triggers legacy compatibility mode).
- ❌ Updating state variables inside `$effect()` based on other state variables (causes render loops).
- ❌ Using legacy `<slot />` instead of type-safe `{#snippet}` and `{@render}`.
- ❌ Creating Svelte stores (`writable`, `derived`) for component-local state (use `$state` instead).

## References & Resources
- Runes Reactivity System: [references/svelte-runes-reactivity-system.md](./references/svelte-runes-reactivity-system.md)
- Snippets & Templating: [references/svelte-snippets-and-templating.md](./references/svelte-snippets-and-templating.md)
- Deep State & Reactive Proxies: [references/svelte-deep-state-and-proxies.md](./references/svelte-deep-state-and-proxies.md)
- Universal Reactivity Modules: [references/svelte-universal-reactivity-modules.md](./references/svelte-universal-reactivity-modules.md)
- Stores & Legacy Migration: [references/svelte-stores-migration-guide.md](./references/svelte-stores-migration-guide.md)
- SvelteKit 2 Full-Stack Architecture: [references/sveltekit-server-and-routing.md](./references/sveltekit-server-and-routing.md)
- Performance Profiling & Anti-Patterns: [references/svelte-performance-and-antipatterns.md](./references/svelte-performance-and-antipatterns.md)
- Svelte 5 Compiler Config: [resources/svelte-config.json](./resources/svelte-config.json)
- SvelteKit Strict TypeScript Config: [resources/tsconfig-svelte.json](./resources/tsconfig-svelte.json)
- Svelte Preprocessor Config: [resources/svelte.config.js](./resources/svelte.config.js)
- Universal Counter Rune Model: [examples/counter_rune.svelte.ts](./examples/counter_rune.svelte.ts)
- Snippet List Dialog Example: [examples/snippet_list_dialog.svelte](./examples/snippet_list_dialog.svelte)
- State Snapshot & Raw Buffer Example: [examples/state_snapshot_clone.svelte.ts](./examples/state_snapshot_clone.svelte.ts)
