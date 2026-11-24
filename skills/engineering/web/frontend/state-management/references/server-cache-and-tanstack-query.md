# Server Cache Architecture and TanStack Query v5

Technical standards for server-state caching, hierarchical query keys, cache eviction, and optimistic mutations with rollback.

---

## 1. Core Principles of Server State

Server state is fundamentally different from client state:
- Owned remotely; local memory is only a cached projection.
- Asynchronous by nature: requires loading, error, and stale states.
- Shared across multiple clients and subject to background invalidation.

---

## 2. TanStack Query v5 Lifecycle Parameters

Configure cache freshness and garbage collection explicitly:

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60,
      retry: 2,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true
    }
  }
});
```

### Parameter Distinction
- `staleTime`: Duration (in milliseconds) before cached data is considered stale. While fresh, queries read directly from memory without network requests.
- `gcTime`: Duration inactive query data remains in cache before being garbage collected from memory.

---

## 3. Hierarchical Query Key Factory Standard

Never hardcode loose strings as query keys. Use strongly-typed query key factories:

```typescript
export const userQueryKeys = {
  all: ['users'] as const,
  lists: () => [...userQueryKeys.all, 'list'] as const,
  list: (filters: { role?: string; page: number }) =>
    [...userQueryKeys.lists(), filters] as const,
  details: () => [...userQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...userQueryKeys.details(), id] as const
};
```

---

## 4. Optimistic Mutations with Rollback Guarantees

Always preserve snapshots of previous state to guarantee clean rollbacks when network requests fail:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

export function useUpdateTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatedTodo: Todo) => {
      const res = await fetch(`/api/todos/${updatedTodo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTodo)
      });
      if (!res.ok) throw new Error('Mutation failed');
      return (await res.json()) as Todo;
    },
    onMutate: async (newTodo) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos']);

      queryClient.setQueryData<Todo[]>(['todos'], (old = []) =>
        old.map((t) => (t.id === newTodo.id ? { ...t, ...newTodo } : t))
      );

      return { previousTodos };
    },
    onError: (_err, _newTodo, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    }
  });
}
```
