# Vue 3.5 Architecture: Reactive Props Destructuring & Two-Way Models

A senior technical guide to Vue 3.5's native reactive props destructuring and `defineModel()` two-way bindings.

---

## 1. Native Reactive Props Destructure (Vue 3.5 Standard)

Prior to Vue 3.5, destructuring `defineProps()` severed the reactive connection:
```typescript
const { count } = defineProps<{ count: number }>();
```

### The Vue 3.5 Compiler Transform
In Vue 3.5+, props destructuring is natively supported and fully reactive:
```vue
<script setup lang="ts">
interface Props {
  title: string;
  count?: number;
}

const { title, count = 0 } = defineProps<Props>();

const doubled = computed(() => count * 2);
</script>
```
Default values (e.g. `count = 0`) are automatically translated into component default prop declarations by the compiler.

---

## 2. Two-Way State Synchronization: `defineModel()`

Replaces verbose `v-model` boilerplates (manually declaring `props.modelValue` and emitting `update:modelValue`):

```vue
<script setup lang="ts">
const searchQuery = defineModel<string>({ default: '' });

const [count, modifiers] = defineModel<number>('count', {
  default: 0
});
</script>

<template>
  <input v-model="searchQuery" />
</template>
```
Any mutation to `searchQuery.value` automatically emits the corresponding `update:modelValue` event to the parent component.
