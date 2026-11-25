# Server Cache Architecture and TanStack Query v5

Technical standards for TanStack Query v5 (`@tanstack/react-query`) object-only APIs, `queryOptions` factories, `gcTime` lifecycle tuning, SSR instantiation, and optimistic mutations with rollback.

---

## 1. TanStack Query v5 Breaking Changes & Lifecycle Parameters

TanStack Query v5 standardized every hook and client method onto a **single-object signature**:
- Positional signatures (`useQuery(key, fn, opts)`, `cancelQueries(key)`, `invalidateQueries(key)`) were removed.
- `cacheTime` was renamed to `gcTime` (Garbage Collection Time for inactive queries).
- `keepPreviousData: true` was replaced by `placeholderData: keepPreviousData`.
- `isLoading` now equals `isPending && isFetching` (the v4 `isInitialLoading` behavior), while initial empty load status is `status === 'pending'` (`isPending`).
- `onSuccess`, `onError`, and `onSettled` callbacks were removed from `useQuery` (use `useMutation` callbacks or global `QueryCache` handlers for side effects).

### `QueryClient` Configuration & SSR Isolation
```typescript
import { QueryClient } from '@tanstack/react-query';

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000),
        refetchOnWindowFocus: false,
        refetchOnReconnect: true
      },
      mutations: {
        retry: 0
      }
    }
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    // Server requests must never share a module-level cache across users.
    return makeQueryClient();
  }
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
```
Note: `retryDelay` must be a `number` or `(attemptIndex, error) => number` function, never a string like `"exponential"`.

---

## 2. Hierarchical Query Key Factory & `queryOptions()`

Combine strongly-typed key factories with TanStack Query v5's `queryOptions()` helper so `useQuery`, `useSuspenseQuery`, `prefetchQuery`, and `getQueryData` share identical keys and inferred types:

```typescript
import { queryOptions, useQuery } from '@tanstack/react-query';

export interface UserFilters {
  role?: string;
  page: number;
}

export interface UserSummary {
  id: string;
  name: string;
}

export const userQueryKeys = {
  all: ['users'] as const,
  lists: () => [...userQueryKeys.all, 'list'] as const,
  list: (filters: UserFilters) => [...userQueryKeys.lists(), filters] as const,
  details: () => [...userQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...userQueryKeys.details(), id] as const
};

export function userListOptions(filters: UserFilters) {
  return queryOptions({
    queryKey: userQueryKeys.list(filters),
    queryFn: async ({ signal }): Promise<UserSummary[]> => {
      const params = new URLSearchParams({ page: String(filters.page) });
      if (filters.role) params.set('role', filters.role);
      const res = await fetch(`/api/users?${params.toString()}`, { signal });
      if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
      return (await res.json()) as UserSummary[];
    },
    staleTime: 60_000
  });
}

export function useUsers(filters: UserFilters) {
  return useQuery(userListOptions(filters));
}
```

---

## 3. Optimistic Mutations with Rollback Guarantees

Always use `{ queryKey }` filter objects in `cancelQueries` and `invalidateQueries`, preserve snapshots, and check `!== undefined` on rollback:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

export const todoQueryKeys = {
  all: ['todos'] as const,
  lists: () => [...todoQueryKeys.all, 'list'] as const
};

export function useUpdateTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatedTodo: Todo): Promise<Todo> => {
      const res = await fetch(`/api/todos/${encodeURIComponent(updatedTodo.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTodo)
      });
      if (!res.ok) throw new Error(`Mutation failed: ${res.status}`);
      return (await res.json()) as Todo;
    },
    onMutate: async (newTodo) => {
      const listKey = todoQueryKeys.lists();
      await queryClient.cancelQueries({ queryKey: listKey });
      const previousTodos = queryClient.getQueryData<Todo[]>(listKey);

      queryClient.setQueryData<Todo[]>(listKey, (old = []) =>
        old.map((t) => (t.id === newTodo.id ? { ...t, ...newTodo } : t))
      );

      return { previousTodos };
    },
    onError: (_err, _newTodo, context) => {
      if (context?.previousTodos !== undefined) {
        queryClient.setQueryData(todoQueryKeys.lists(), context.previousTodos);
      }
    },
    onSettled: () => {
      return queryClient.invalidateQueries({ queryKey: todoQueryKeys.lists() });
    }
  });
}
```
Returning `queryClient.invalidateQueries(...)` from `onSettled` keeps the mutation in `isPending` state until the authoritative refetch completes.
