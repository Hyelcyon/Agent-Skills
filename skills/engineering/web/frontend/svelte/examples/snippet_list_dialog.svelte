<script lang="ts">
import type { Snippet } from 'svelte';

interface ListItem {
  id: string;
  name: string;
  active: boolean;
}

interface DialogProps {
  title: string;
  items: ListItem[];
  open?: boolean;
  header?: Snippet;
  itemTemplate?: Snippet<[item: ListItem]>;
}

let {
  title,
  items,
  open = $bindable(false),
  header,
  itemTemplate
}: DialogProps = $props();

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
  class="snippet-dialog"
  aria-labelledby="snippet-dialog-title"
  onclose={() => {
    open = false;
  }}
>
  <div class="dialog-header">
    {#if header}
      {@render header()}
    {:else}
      <h2 id="snippet-dialog-title">{title}</h2>
    {/if}
    <button type="button" onclick={() => { open = false; }} aria-label="Close dialog">
      Close
    </button>
  </div>

  <ul class="item-list">
    {#each items as item (item.id)}
      <li>
        {#if itemTemplate}
          {@render itemTemplate(item)}
        {:else}
          <span>{item.name} ({item.active ? 'Active' : 'Inactive'})</span>
        {/if}
      </li>
    {/each}
  </ul>
</dialog>
