# Vue 3.5 Architecture: SSR Hydration & Top Anti-Patterns

A senior engineering guide to Server-Side Rendering (Nuxt / Vue SSR) hydration consistency and eliminating the top 10 Vue anti-patterns.

---

## 1. SSR Hydration Invariants

During Server-Side Rendering (SSR), the server outputs static HTML, and the client browser "hydrates" it by attaching reactive listeners:

### Avoiding Hydration Mismatches
1. **Never Read Browser-Only Globals in Setup**:
   - Reading `window`, `document`, or `localStorage` during initial setup breaks SSR because they do not exist in Node.js.
   - Defer browser-only logic to the `onMounted()` lifecycle hook.
2. **HTML Validity**:
   - Ensure tables contain `<tbody>` tags; browsers implicitly insert `<tbody>` if omitted, causing hydration mismatch warnings.

---

## 2. Top 10 Vue Anti-Patterns to Eliminate

1. ❌ **Using Options API for Complex Features**: Fragmentation of domain logic across disparate option blocks. Use Composition API `<script setup>`.
2. ❌ **Mutating Props Directly**: Violates unidirectional data flow. Use `emit()` or `defineModel()`.
3. ❌ **Breaking Reactivity with Spread**: Writing `{ ...props }` or `{ ...state }` severs Proxy tracking. Use `toRefs()`.
4. ❌ **Using `watch()` for Derived State**: Use `computed()` to calculate values declaratively.
5. ❌ **Direct DOM Manipulation**: Avoid `document.getElementById()`. Use `useTemplateRef()`.
6. ❌ **Global Event Bus Anti-Pattern**: Do not use mitt or event emitters for cross-component communication. Use Pinia or provide/inject.
7. ❌ **Forgetting Cleanup in Custom Composables**: Always clean up event listeners and timers in `onUnmounted()`.
8. ❌ **Using `v-if` with `v-for` on the Same Element**: `v-if` has higher priority and cannot access the iteration variable. Use a `<template v-for>` wrapper or filter the array in `computed()`.
9. ❌ **Missing `key` in `v-for`**: Always provide a stable unique identifier (e.g. `:key="item.id"`), never the array index if the list changes.
10. ❌ **Over-Reactivity**: Wrapping large static datasets in deep `ref()`. Use `shallowRef()` for read-only tables.
