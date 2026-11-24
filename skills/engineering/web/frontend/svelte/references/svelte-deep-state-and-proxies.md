# Svelte 5 Deep State and Reactive Proxies

Engineering standards for deeply reactive proxies, in-place mutations, non-reactive raw state, and snapshot serialization in Svelte 5.

---

## 1. Deep Reactive Proxies in `$state()`

In Svelte 5, passing an object, array, `Map`, or `Set` to `$state()` wraps the structure in a transparent reactive Proxy:

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
    id: `t_${Date.now()}`,
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
<button onclick={() => addTodo('Task Beta')}>Add Item</button>
```

### In-Place Mutation Mechanics
- Modifying nested properties (`todo.completed = true`) or calling mutator methods (`todos.push(...)`, `todos.splice(...)`) directly triggers fine-grained signal notifications.
- Reassigning entire arrays or cloning objects (`todos = [...todos, item]`) is unnecessary.

---

## 2. High-Performance Raw State: `$state.raw()`

Deep proxies introduce slight memory and tracking overhead. For large datasets, immutable records, WebGL buffers, or third-party instances that should not be tracked deeply, use `$state.raw()`:

```svelte
<script lang="ts">
let chartBuffer = $state.raw<Float64Array>(new Float64Array(100000));

function replaceBuffer(newBuffer: Float64Array): void {
  chartBuffer = newBuffer;
}
</script>
```

### Characteristics of `$state.raw()`
- Shallow reactivity only: Reading nested properties does not register dependencies.
- Reassignment triggers view updates (`chartBuffer = newBuffer`), but mutating inner items (`chartBuffer[0] = 5`) does not.

---

## 3. Serialization and Snapshots: `$state.snapshot()`

Because `$state()` objects are wrapped in proxies, passing them to external libraries, Web Workers, or `structuredClone` can trigger proxy traversal issues.
Use `$state.snapshot()` to extract an un-proxied, deep copy:

```svelte
<script lang="ts">
let config = $state({
  settings: {
    retries: 3,
    debugMode: false
  }
});

function exportConfiguration(): void {
  const pureJson = $state.snapshot(config);
  navigator.clipboard.writeText(JSON.stringify(pureJson, null, 2));
}
</script>
```
