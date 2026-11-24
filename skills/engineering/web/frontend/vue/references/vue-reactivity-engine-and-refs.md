# Vue 3.5 Architecture: Core Reactivity Engine & Primitives

A deep dive into Vue 3.5's rewritten reactivity system, memory optimization algorithms, and reactive primitive selections.

---

## 1. Vue 3.5 Reactivity Engine Overhaul

Vue 3.5 introduced a complete overhaul of the reactive dependency tracking engine:
- **56% Memory Footprint Reduction**: Achieved by switching from heavy internal dependency objects to a doubly-linked list representation for tracking subscriber relationships.
- **Array Mutation Speedup**: Large reactive arrays perform mutations up to 10x faster.
- **Automatic Garbage Collection**: Unsubscribed computed properties and lingering watchers are immediately collected upon component unmount, preventing silent memory leaks in long-running SPAs.

---

## 2. Choosing Reactive Primitives: `ref()` vs `reactive()`

### The Enterprise Standard: `ref()` as Default
Senior Vue engineering mandates `ref()` over `reactive()` for general state:
- **Explicit Access (`.value`)**: Makes it immediately apparent in code where reactive state mutations are occurring.
- **Preserved Reactivity on Reassignment**: You can reassign a `ref` (`myRef.value = newObj`) without losing reactivity. In contrast, reassigning a `reactive()` object directly replaces the proxy with a standard object, permanently severing reactivity.
- **Primitive Support**: `ref()` seamlessly handles strings, numbers, and booleans, whereas `reactive()` requires object wrappers.

### When to Use `shallowRef()`
For large datasets (thousands of table rows or real-time sensor streams) where internal properties are not mutated individually:
- `shallowRef()` only tracks `.value` reassignment, bypassing recursive proxy creation and saving significant CPU cycles.
