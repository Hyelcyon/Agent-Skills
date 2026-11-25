# SvelteKit 2 and Svelte 5 Full-Stack Architecture

Engineering specifications for SvelteKit 2 applications using Svelte 5 Runes, `$app/state`, server load functions, Form Actions, and SSR state isolation.

---

## 1. Page Component Data Binding with Runes

Incoming server `data` and form action `form` props are bound via `$props()`. Use standard HTML `value` (or `bind:value`) on `<input>`, not React's `defaultValue` prop:

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
  <div class="alert danger" role="alert">{form.error}</div>
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
  <input id="name" name="name" type="text" value={data.workspace.name} required />
  <button type="submit" disabled={isSubmitting}>
    {isSubmitting ? 'Saving...' : 'Save Changes'}
  </button>
</form>
```

---

## 2. Server Load Functions: `+page.server.ts`

In SvelteKit 2, `error()` and `redirect()` throw internally and have return type `never`. Call `error(401, ...)` directly without `throw`, and never swallow `error()`/`redirect()` inside broad `try/catch` blocks:

```typescript
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
  const user = locals.user;
  if (!user) {
    error(401, 'Unauthorized');
  }

  const workspace = await locals.db.getWorkspace(params.workspaceId);
  if (!workspace) {
    error(404, 'Workspace not found');
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

Form Actions execute server mutations with progressive enhancement even before client JS hydrates:

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

    await locals.db.updateWorkspaceName(name.trim());

    return { success: true };
  }
};
```

---

## 4. Architectural Rules for SvelteKit

- **Prevent SSR Cross-Request State Leakage**: Never store user, session, or request-specific `$state` in module-level variables inside `.svelte.ts` files. Pass server state via `load` functions/`locals` and instantiate shared client models per request using `setContext`/`getContext` in root `+layout.svelte`.
- **Keep Server Secrets Server-Only**: Never import `$env/static/private`, `$env/dynamic/private`, or database clients inside `.svelte`, `+page.ts`, or `+layout.ts` files (use `+page.server.ts` or `*.server.ts`).
- **Use `$app/state` Over `$app/stores`**: Access `page.url`, `page.data`, and `navigating` from `$app/state` cleanly with Runes.
- **Prune Returned Payloads**: Return only fields actually needed by the template to minimize serialized hydration HTML payloads.
