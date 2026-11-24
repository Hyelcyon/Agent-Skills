---
name: vue
description: Use when building, refactoring, or optimizing Vue.js applications, authoring Vue 3.5 Composition API components with script setup, leveraging reactive props destructuring, or creating custom composables.
---

# Enterprise Vue 3.5 Architecture & Agent Operational Runbook

Senior engineering standards for modern Vue 3.5+ web applications: the Composition API, `<script setup lang="ts">`, reactive props destructuring, `useTemplateRef`, custom composables, and anti-pattern elimination.

## When to Use
- Writing or refactoring Vue Single File Components (SFC) using Vue 3.5+ Composition API standards.
- Destructuring `defineProps()` natively while preserving reactive tracking.
- Type-safely binding DOM elements via `useTemplateRef()`.
- Extracting reusable domain logic into strongly-typed composables (`use*`).
- Migrating legacy Options API components to `<script setup lang="ts">`.

## When NOT to Use
- Managing global CSS container queries or pure DOM accessibility outside Vue (use `ui-ux`).
- Authoring server-side database repositories or backend microservices (use `architecture`).

---

## 1. Autonomous Agent Operational Protocol

When developing or refactoring Vue components, the agent must execute these 6 sequential phases:

```
[Phase 1: Component Audit] ──> [Phase 2: State Definition] ──> [Phase 3: Derived Reactivity] ──> [Phase 4: Composable Extraction] ──> [Phase 5: Template Binding] ──> [Phase 6: Verification]
   Mandate script setup lang=ts     Declare ref & defineProps     Use computed over watchers       Extract logic to composable      Bind via useTemplateRef         vue-tsc & test
```

### Phase 1: Script Setup Enforcement
1. All new components must use `<script setup lang="ts">`.
2. Do not use legacy Options API (`export default { data(), methods }`) or verbose `defineComponent` wrapper objects.

### Phase 2: Reactive State Definition
1. Use `ref()` as the default primitive for state variables.
2. Utilize native Vue 3.5 reactive props destructuring with default value assignments:
   ```vue
   <script setup lang="ts">
   interface Props {
     title: string;
     limit?: number;
   }
   const { title, limit = 10 } = defineProps<Props>();
   </script>
   ```

### Phase 3: Derived Reactivity Standard
1. Never use `watch()` to calculate a value from other reactive properties. Always use `computed()`.
2. Ensure computed getters are pure functions with zero side effects.

### Phase 4: Composable Extraction
1. When state and methods represent a cohesive domain concept, extract them into a reusable composable (`useFeature`).
2. Accept `MaybeRefOrGetter<T>` parameters and unwrap them using `toValue()` to support both static values and reactive refs.

### Phase 5: Template & DOM Binding
1. Bind template elements using `useTemplateRef<T>('refName')` rather than loose `ref(null)`.
2. Use `defineModel()` for two-way component bindings (`v-model`).

### Phase 6: Verification & Quality Gate
1. Execute the Vue type-checker and ensure zero SFC type diagnostics:
   ```bash
   npx vue-tsc --noEmit
   ```
2. Run automated component unit tests via Vitest:
   ```bash
   npm test
   ```
3. Inspect the emitted reactivity graph to confirm reactive props tracking is preserved.

---

## 2. Critical Anti-Patterns to Avoid
- ❌ Using the Options API for complex enterprise components.
- ❌ Spreading reactive objects (`{ ...state }`) without `toRefs()`, which breaks reactivity.
- ❌ Mutating props directly inside child components.
- ❌ Using `watch()` to manually synchronize derived state instead of `computed()`.

## References & Resources
- Reactivity Engine & Refs: [references/vue-reactivity-engine-and-refs.md](./references/vue-reactivity-engine-and-refs.md)
- Composition API & Script Setup: [references/vue-composition-api-and-script-setup.md](./references/vue-composition-api-and-script-setup.md)
- Props Destructuring & Model Sync: [references/vue-props-destructure-and-models.md](./references/vue-props-destructure-and-models.md)
- Template Refs & DOM: [references/vue-template-refs-and-dom.md](./references/vue-template-refs-and-dom.md)
- Composables Architecture & State: [references/vue-composables-and-state.md](./references/vue-composables-and-state.md)
- Vapor Mode & Compiler Optimizations: [references/vue-vapor-mode-and-compiler.md](./references/vue-vapor-mode-and-compiler.md)
- SSR Invariants & Anti-Patterns: [references/vue-ssr-and-antipatterns.md](./references/vue-ssr-and-antipatterns.md)
- Vue Compiler Config: [resources/vue-compiler.json](./resources/vue-compiler.json)
- Strict Vue TypeScript Config: [resources/tsconfig-vue.json](./resources/tsconfig-vue.json)
- Vite 6 Vue Plugin Config: [resources/vite-vue-config.ts](./resources/vite-vue-config.ts)
- Modern Counter Composable Example: [examples/modern_counter_composable.ts](./examples/modern_counter_composable.ts)
- Reactive Props & Model Card Example: [examples/reactive_props_card.vue](./examples/reactive_props_card.vue)
- Template Ref Focus Example: [examples/template_ref_focus.vue](./examples/template_ref_focus.vue)
