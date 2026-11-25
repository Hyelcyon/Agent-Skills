# Svelte 5 Snippets and Templating Architecture

A technical specification of Svelte 5 Snippets (`{#snippet}`), render tags (`{@render}`), legacy `<slot />` replacement, and parameterized template composition.

---

## 1. The Snippet Paradigm vs Legacy Slots

Svelte 5 deprecates `<slot />`, `<slot name="...">`, and `<svelte:fragment>` in favor of **Snippets**:
- **First-Class Values**: Snippets can be passed as props, stored in variables, and conditionally rendered.
- **TypeScript Verified**: `Snippet<[arg1: Type1, ...]>` validates parameter arity and types at compile time.
- **Explicit Invocation**: Render snippets with `{@render mySnippet(arg)}` or safe optional `{@render optionalSnippet?.(arg)}`.

---

## 2. Declaring and Rendering Local Snippets

Snippets can be declared anywhere in a template and can recursively invoke themselves for tree structures:

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

### Child Component (`Modal.svelte`)
Use native `<dialog>` for accessible modal focus trapping and `Escape` handling, paired with typed `Snippet` props:

```svelte
<script lang="ts">
import type { Snippet } from 'svelte';

interface ModalProps {
  title: string;
  open?: boolean;
  header?: Snippet;
  children?: Snippet;
  footer?: Snippet<[actionCount: number]>;
}

let { title, open = $bindable(false), header, children, footer }: ModalProps = $props();
let dialogEl = $state<HTMLDialogElement>();

$effect(() => {
  if (!dialogEl) return;
  if (open && !dialogEl.open) {
    dialogEl.showModal();
  } else if (!open && dialogEl.open) {
    dialogEl.close();
  }
});
</script>

<dialog
  bind:this={dialogEl}
  class="modal-dialog"
  aria-labelledby="modal-title"
  onclose={() => { open = false; }}
>
  <div class="modal-header">
    {#if header}
      {@render header()}
    {:else}
      <h2 id="modal-title">{title}</h2>
    {/if}
  </div>

  <div class="modal-body">
    {@render children?.()}
  </div>

  {#if footer}
    <div class="modal-footer">
      {@render footer(2)}
    </div>
  {/if}
</dialog>
```

### Parent Invocation
```svelte
<script lang="ts">
import Modal from './Modal.svelte';

let isModalOpen = $state(false);
</script>

<button type="button" onclick={() => { isModalOpen = true; }}>Open Settings</button>

<Modal title="System Configuration" bind:open={isModalOpen}>
  {#snippet header()}
    <h2>Custom System Header</h2>
  {/snippet}

  <p>Main modal body content rendered inside the default children snippet.</p>

  {#snippet footer(actionCount)}
    <button type="button" onclick={() => { isModalOpen = false; }}>
      Confirm ({actionCount} pending)
    </button>
    <button type="button" onclick={() => { isModalOpen = false; }}>Cancel</button>
  {/snippet}
</Modal>
```

---

## 4. Default Slot Replacement: `children` Snippet

Markup placed directly between opening and closing component tags is automatically passed as the `children` Snippet prop:

```svelte
<script lang="ts">
import type { Snippet } from 'svelte';

let { children }: { children?: Snippet } = $props();
</script>

<section class="container">
  {@render children?.()}
</section>
```
