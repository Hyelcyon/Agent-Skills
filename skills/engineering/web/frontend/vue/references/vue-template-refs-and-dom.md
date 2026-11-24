# Vue 3.5 Architecture: Type-Safe Template Refs & DOM Access

A senior guide to Vue 3.5's `useTemplateRef()`, dynamic ref binding, and DOM lifecycle coordination.

---

## 1. Modern `useTemplateRef()` (Vue 3.5 API)

Historically, matching a template ref required declaring a `ref(null)` variable whose variable name matched the template `ref="name"` string:
- Ambiguous and fragile when refactoring or renaming variables.
- Required awkward casting for component instances or custom elements.

### The Vue 3.5 Standard
Vue 3.5 introduced the `useTemplateRef()` API:

```vue
<script setup lang="ts">
import { useTemplateRef, onMounted } from 'vue';

const inputEl = useTemplateRef<HTMLInputElement>('searchInput');

onMounted(() => {
  inputEl.value?.focus();
});
</script>

<template>
  <input ref="searchInput" placeholder="Search records..." />
</template>
```

---

## 2. Dynamic Template Refs in Iterations

When binding refs inside `v-for`, pass an inline function to manage collection references cleanly:

```vue
<script setup lang="ts">
import { ref } from 'vue';

const itemElements = ref<HTMLElement[]>([]);

const setItemRef = (el: any) => {
  if (el) {
    itemElements.value.push(el);
  }
};
</script>

<template>
  <ul>
    <li v-for="item in items" :key="item.id" :ref="setItemRef">
      {{ item.name }}
    </li>
  </ul>
</template>
```
Always reset the array before render updates to prevent collecting stale DOM references.
