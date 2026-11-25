# React 19 Architecture: Server Actions & Asynchronous Mutations

An in-depth guide to Server Actions (`'use server'`), form actions, optimistic UI updates, and mutation security.

---

## 1. What are Server Actions?

Server Actions are asynchronous functions marked with `'use server'` that execute on the server but can be invoked directly from client components or native `<form>` elements:
- They abstract RPC endpoints, automatic serialization, and cache invalidation.
- When passed to a `<form action={serverAction}>`, they enable progressive enhancement—forms can submit even before client JavaScript has finished loading.

---

## 2. The Core Action Hooks Suite

### `useActionState` (Asynchronous Action Lifecycle)
Replaces manual `isLoading` state, try/catch blocks, and error state variables:

```tsx
const [state, formAction, isPending] = useActionState(
  async (prevState: FormState, formData: FormData) => {
    const rawEmail = formData.get('email');
    if (typeof rawEmail !== 'string' || !rawEmail.trim()) {
      return { status: 'error', message: 'Valid email is required' };
    }
    const result = await subscribeUser(rawEmail.trim());
    if (!result.success) {
      return { status: 'error', message: result.error };
    }
    return { status: 'success', message: 'Subscribed successfully' };
  },
  { status: 'idle', message: '' }
);
```

### `useOptimistic` (Zero-Latency UI Updates)
Updates the visual interface immediately before the server response returns, with automatic rollback on rejection:

```tsx
const [optimisticTasks, addOptimisticTask] = useOptimistic(
  tasks,
  (currentTasks, newTitle: string) => [
    ...currentTasks,
    { id: 'optimistic-id', title: newTitle, pending: true }
  ]
);
```

### `useFormStatus` (Child Pending Detection)
Enables submit buttons or status spinners deep in the form tree to read the parent `<form>` submission state without prop drilling:

```tsx
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Saving...' : 'Save Changes'}
    </button>
  );
}
```

---

## 3. Server Action Security Standards

1. **Treat Actions as Public HTTP Endpoints**:
   - Any client can invoke an exported Server Action. Always authenticate the session and authorize the user inside the action body.
2. **Input Validation**:
   - Never trust input from `FormData` or arguments passed to a Server Action. Validate with Zod before database operations.
3. **Prevent Action Injection**:
   - Do not pass closure-scoped sensitive tokens into Server Actions that could be serialized into client-side action IDs.
