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
  header?: Snippet;
  itemTemplate?: Snippet<[item: ListItem]>;
}

let { title, items, header, itemTemplate }: DialogProps = $props();
</script>

<div class="snippet-dialog" role="dialog" aria-label={title}>
  <div class="dialog-header">
    {#if header}
      {@render header()}
    {:else}
      <h2>{title}</h2>
    {/if}
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
</div>
