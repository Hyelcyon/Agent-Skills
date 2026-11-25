# Svelte 5 Deep State and Reactive Proxies

Engineering standards for deeply reactive proxies, reactive built-in collections (`SvelteMap`/`SvelteSet`), shallow raw state (`$state.raw`), and un-proxied snapshot serialization (`$state.snapshot`).

---

## 1. Deep Reactive Proxies in `$state()`

Passing a **plain object or array** to `$state()` wraps it recursively in a fine-grained reactive `Proxy`:

```svelte
<script lang="ts">
interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

let todos = $state<TodoItem[]>([
  { id: 't1', text: 'Task Alpha', completed: false }
]);

function addTodo(text: string): void {
  todos.push({
    id: crypto.randomUUID(),
    text,
    completed: false
  });
}

function toggleTodo(todo: TodoItem): void {
  todo.completed = !todo.completed;
}
</script>

<ul>
  {#each todos as todo (todo.id)}
    <li>
      <input
        type="checkbox"
        checked={todo.completed}
        onchange={() => toggleTodo(todo)}
      />
      <span>{todo.text}</span>
    </li>
  {/each}
</ul>
<button type="button" onclick={() => addTodo('Task Beta')}>Add Item</button>
```

### Proxy Invariants & Pitfalls
- **In-Place Mutations Work**: `todo.completed = true` and `todos.push(...)` notify only fine-grained subscribers.
- **Destructuring Severs Reactivity**: `const { text } = todo;` captures a non-reactive string copy; read `todo.text` directly or derive via `$derived(todo.text)`.
- **Proxy Identity Mismatch**: `$state(rawObj) === rawObj` evaluates to `false` because `$state` returns a `Proxy`; match items by stable ID instead of object reference identity.

---

## 2. Reactive Built-In Collections (`SvelteMap`, `SvelteSet`)

`$state()` does **NOT** proxy built-in `Map`, `Set`, `Date`, `URL`, or arbitrary class instances. Calling `.set()` or `.add()` on `$state(new Map())` triggers zero updates. Use Svelte 5's reactive collection classes from `'svelte/reactivity'`:

```svelte
<script lang="ts">
import { SvelteSet } from 'svelte/reactivity';

const selectedIds = new SvelteSet<string>();

function toggleSelection(id: string): void {
  if (selectedIds.has(id)) {
    selectedIds.delete(id);
  } else {
    selectedIds.add(id);
  }
}
</script>

<p>Selected: {selectedIds.size}</p>
```
Note: `SvelteMap` and `SvelteSet` track structural membership (`.set`, `.delete`, `.add`, `.clear`); plain objects stored inside them must still be wrapped in `$state(...)` if their inner properties are mutated in place.

---

## 3. High-Performance Raw State: `$state.raw()`

Deep proxies add allocation overhead for massive tables, WebGL typed buffers, or immutable records. Use `$state.raw()` when values are only replaced wholesale:

```svelte
<script lang="ts">
let chartBuffer = $state.raw<Float64Array>(new Float64Array(100000));

function replaceBuffer(newBuffer: Float64Array): void {
  // Reassigning triggers updates; mutating chartBuffer[0] directly does not.
  chartBuffer = newBuffer;
}
</script>
```

---

## 4. Serialization and Snapshots: `$state.snapshot()`

Structured cloning (`structuredClone`, `postMessage`, IndexedDB, external SDKs) can fail or behave unexpectedly on `Proxy` wrappers. Use `$state.snapshot()` to obtain a plain, un-proxied deep clone:

```svelte
<script lang="ts">
let config = $state({
  settings: {
    retries: 3,
    debugMode: false
  }
});

async function exportConfiguration(): Promise<void> {
  const plainConfig = $state.snapshot(config);
  await navigator.clipboard.writeText(JSON.stringify(plainConfig, null, 2));
}
</script>
```
