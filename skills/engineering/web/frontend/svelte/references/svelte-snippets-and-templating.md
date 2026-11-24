# Svelte 5 Snippets and Templating Architecture

A technical specification of Svelte 5 Snippets (`{#snippet}`), render tags (`{@render}`), component slots deprecation, and parameterized template composition.

---

## 1. The Snippet Paradigm vs Legacy Slots

Svelte 5 deprecates `<slot />`, `<slot name="...">`, and `<svelte:fragment>` in favor of **Snippets**:
- First-class JavaScript values: Snippets can be stored in variables, passed as props, and conditionally rendered.
- Strongly typed: Snippet parameters are verified by the TypeScript compiler.
- Explicit invocation: Snippets are rendered using `{@render mySnippet(arg)}`.

---

## 2. Declaring and Rendering Snippets

Snippets are declared inside templates and invoked like functions:

```svelte
<script lang="ts">
interface UserRecord {
  id: string;
  name: string;
  role: string;
}

let users = $state<UserRecord[]>([
  { id: '1', name: 'Alice', role: 'Admin' },
  { id: '2', name: 'Bob', role: 'Editor' }
]);
</script>

{#snippet userCard(user: UserRecord)}
  <div class="user-card">
    <strong>{user.name}</strong>
    <span class="role">{user.role}</span>
  </div>
{/snippet}

<div class="user-grid">
  {#each users as user (user.id)}
    {@render userCard(user)}
  {/each}
</div>
```

---

## 3. Passing Snippets as Props to Components

Snippets are passed to child components via standard props:

### Child Component (`Modal.svelte`)
```svelte
<script lang="ts">
import type { Snippet } from 'svelte';

interface ModalProps {
  title: string;
  header?: Snippet;
  children: Snippet;
  footer?: Snippet<[actionCount: number]>;
}

let { title, header, children, footer }: ModalProps = $props();
</script>

<div class="modal-dialog" role="dialog" aria-label={title}>
  <div class="modal-header">
    {#if header}
      {@render header()}
    {:else}
      <h2>{title}</h2>
    {/if}
  </div>

  <div class="modal-body">
    {@render children()}
  </div>

  {#if footer}
    <div class="modal-footer">
      {@render footer(2)}
    </div>
  {/if}
</div>
```

### Parent Invocation
```svelte
<script lang="ts">
import Modal from './Modal.svelte';
</script>

<Modal title="System Configuration">
  {#snippet header()}
    <h2>Custom System Header</h2>
  {/snippet}

  <p>Main modal body content rendered inside default children snippet.</p>

  {#snippet footer(actionCount)}
    <button>Confirm ({actionCount} actions pending)</button>
    <button>Cancel</button>
  {/snippet}
</Modal>
```

---

## 4. Default Slot Replacement: `children` Snippet

When content is placed directly between component opening and closing tags, Svelte 5 automatically assigns it to the `children` prop:

```svelte
<script lang="ts">
import type { Snippet } from 'svelte';

let { children }: { children: Snippet } = $props();
</script>

<section class="container">
  {@render children()}
</section>
```
