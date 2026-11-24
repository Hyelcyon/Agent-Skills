# Vue 3.5 Architecture: Composition API & Script Setup Standard

An authoritative guide to `<script setup lang="ts">`, compile-time macro contracts, and component composition.

---

## 1. Why `<script setup lang="ts">` is Mandatory

- **Zero Boilerplate**: Top-level variables, functions, and imports are automatically exposed to the template without manual `return { ... }` blocks.
- **Optimal Compilation**: Templates compile directly into inline render functions with direct lexical scope access to variables, bypassing `this` proxy lookups.
- **Full TypeScript Type Inference**: Props, emits, and slots receive exact compiler-verified types.

---

## 2. Compile-Time Macros

Macros are executed by the compiler during SFC parsing and are never imported at runtime:

### `defineProps<Props>()`
Defines strictly typed input interfaces:
```vue
<script setup lang="ts">
interface Props {
  userId: string;
  role?: 'admin' | 'member';
}
const props = defineProps<Props>();
</script>
```

### `defineEmits<Emits>()`
Defines strictly typed event emitters:
```vue
<script setup lang="ts">
const emit = defineEmits<{
  (e: 'save', payload: { id: string }): void;
  (e: 'cancel'): void;
}>();
</script>
```

### `defineSlots<Slots>()`
Provides compile-time typing for template slots and scoped slot parameters.
