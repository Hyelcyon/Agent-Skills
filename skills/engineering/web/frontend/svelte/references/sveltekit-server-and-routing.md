# SvelteKit 2 and Svelte 5 Full-Stack Architecture

Engineering specifications for modern SvelteKit 2 applications leveraging Svelte 5 Runes, server load functions, and form actions.

---

## 1. Page Component Data Binding with Runes

In SvelteKit 2 with Svelte 5, incoming server data and form action responses are bound using `$props()`:

```svelte
<script lang="ts">
import type { PageData, ActionData } from './$types';
import { enhance } from '$app/forms';

interface Props {
  data: PageData;
  form?: ActionData;
}

let { data, form }: Props = $props();
let isSubmitting = $state(false);
</script>

<h1>{data.workspace.name}</h1>

{#if form?.error}
  <div class="alert danger">{form.error}</div>
{/if}

<form
  method="POST"
  action="?/updateWorkspace"
  use:enhance={() => {
    isSubmitting = true;
    return async ({ update }) => {
      isSubmitting = false;
      await update();
    };
  }}
>
  <label for="name">Workspace Name</label>
  <input id="name" name="name" type="text" defaultValue={data.workspace.name} />
  <button type="submit" disabled={isSubmitting}>
    {isSubmitting ? 'Saving...' : 'Save Changes'}
  </button>
</form>
```

---

## 2. Server Load Functions: `+page.server.ts`

Fetch server data securely without exposing database credentials to the client:

```typescript
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
  const user = locals.user;
  if (!user) {
    throw error(401, 'Unauthorized');
  }

  const workspace = await locals.db.getWorkspace(params.workspaceId);
  if (!workspace) {
    throw error(404, 'Workspace not found');
  }

  return {
    workspace: {
      id: workspace.id,
      name: workspace.name,
      tier: workspace.tier
    }
  };
};
```

---

## 3. Server Form Actions: Mutating State

Form Actions handle server-side mutations cleanly with progressive enhancement:

```typescript
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const actions: Actions = {
  updateWorkspace: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { error: 'Unauthorized mutation' });
    }

    const formData = await request.formData();
    const name = formData.get('name');

    if (typeof name !== 'string' || name.trim().length === 0) {
      return fail(400, { error: 'Workspace name is required' });
    }

    await locals.db.updateWorkspaceName(name);

    return { success: true };
  }
};
```

---

## 4. Architectural Rules for SvelteKit
- Never import server-only modules (`$env/static/private`, database clients) inside `+page.svelte` or `.svelte` components.
- Use `use:enhance` on all `<form>` elements to allow client-side AJAX updates while maintaining full fallback functionality if JavaScript fails to load.
- Avoid passing massive un-pruned database models across the server-client boundary. Return only the fields needed by the template.
