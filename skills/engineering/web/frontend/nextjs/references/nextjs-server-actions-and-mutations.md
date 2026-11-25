# Next.js 15 Server Actions and Data Mutations

Engineering standards for authoring, securing, and revalidating data mutations using Next.js 15 Server Actions.

---

## 1. The Server Action Standard

Server Actions execute server-side functions invoked directly from client components or native HTML forms:
- Zero manual API boilerplate: Eliminates the need to write separate Route Handlers for standard mutations.
- Progressive enhancement: Form submissions work even before client-side JavaScript completes hydration.
- Cryptographic action IDs: Next.js generates secure endpoint hashes for action verification.

---

## 2. Server Action Declaration Standard

Declare actions in dedicated server files marked with `'use server'`:

```typescript
'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { verifySession } from '@/lib/server-auth';

interface ActionResponse {
  success: boolean;
  error?: string;
}

export async function updateUsernameAction(
  _prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_id')?.value;
  const session = sessionCookie ? await verifySession(sessionCookie) : null;

  if (!session) {
    return { success: false, error: 'Unauthorized mutation' };
  }

  const rawUsername = formData.get('username');
  if (typeof rawUsername !== 'string' || rawUsername.trim().length < 3) {
    return { success: false, error: 'Username must be at least 3 characters' };
  }

  const response = await fetch('https://api.enterprise.com/user/profile', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId: session.userId, username: rawUsername.trim() })
  });

  if (!response.ok) {
    return { success: false, error: 'Failed to update username' };
  }

  revalidatePath('/profile');
  return { success: true };
}
```

---

## 3. Client Form Integration: `useActionState` and `useFormStatus`

Consume the action using React 19's `useActionState`:

```tsx
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateUsernameAction } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Updating...' : 'Save Username'}
    </button>
  );
}

export function UsernameEditor() {
  const [state, formAction, isPending] = useActionState(updateUsernameAction, { success: false });

  return (
    <form action={formAction} aria-busy={isPending}>
      <input name="username" type="text" placeholder="New username" required />
      <SubmitButton />
      {state.error && <p className="error">{state.error}</p>}
      {state.success && <p className="success">Username successfully updated</p>}
    </form>
  );
}
```

---

## 4. Revalidation Invariants
- Always invoke `revalidatePath()` or `revalidateTag()` immediately following a successful database write to purge stale cache records.
- If performing a navigation after mutation, call `redirect()` outside of `try/catch` blocks; `redirect()` throws a native Next.js internal control-flow exception.
