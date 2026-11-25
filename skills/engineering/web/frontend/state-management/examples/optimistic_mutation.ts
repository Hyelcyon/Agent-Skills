interface QueryFilters {
  queryKey: readonly unknown[];
  exact?: boolean;
}

/**
 * Minimal TanStack Query v5 cache client contract using single-object filter signatures.
 */
interface QueryCacheClient<TData> {
  cancelQueries(filters: QueryFilters): Promise<void>;
  getQueryData(queryKey: readonly unknown[]): TData | undefined;
  setQueryData(queryKey: readonly unknown[], updater: (old: TData | undefined) => TData): void;
  invalidateQueries(filters: QueryFilters): Promise<void>;
}

interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
}

interface MutationContext<TData> {
  previousData?: TData;
}

const TODOS_QUERY_KEY = ['todos'] as const;

/**
 * Coordinates TanStack Query v5 optimistic cache updates with snapshot capture and rollback.
 */
class OptimisticTodoMutationHandler {
  private readonly queryClient: QueryCacheClient<TodoItem[]>;
  private readonly remoteApi: { updateTodo: (todo: TodoItem) => Promise<TodoItem> };

  constructor(
    queryClient: QueryCacheClient<TodoItem[]>,
    remoteApi: { updateTodo: (todo: TodoItem) => Promise<TodoItem> }
  ) {
    this.queryClient = queryClient;
    this.remoteApi = remoteApi;
  }

  /**
   * Cancels in-flight todo queries, snapshots current cache data, and applies optimistic update.
   */
  async onMutate(updatedTodo: TodoItem): Promise<MutationContext<TodoItem[]>> {
    await this.queryClient.cancelQueries({ queryKey: TODOS_QUERY_KEY });

    const previousData = this.queryClient.getQueryData(TODOS_QUERY_KEY);

    this.queryClient.setQueryData(TODOS_QUERY_KEY, (old = []) =>
      old.map((item) => (item.id === updatedTodo.id ? { ...item, ...updatedTodo } : item))
    );

    return { previousData };
  }

  /**
   * Restores the cached todo list snapshot when the remote mutation fails.
   */
  onError(context?: MutationContext<TodoItem[]>): void {
    // Guard against undefined explicitly so valid empty/falsy snapshots still roll back.
    if (context?.previousData !== undefined) {
      const snapshot = context.previousData;
      this.queryClient.setQueryData(TODOS_QUERY_KEY, () => snapshot);
    }
  }

  /**
   * Marks cached todos stale so authoritative server state reconciles after success or rollback.
   */
  async onSettled(): Promise<void> {
    await this.queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
  }

  /**
   * Executes the full optimistic mutation lifecycle against the remote API.
   */
  async execute(updatedTodo: TodoItem): Promise<TodoItem> {
    const context = await this.onMutate(updatedTodo);
    try {
      const result = await this.remoteApi.updateTodo(updatedTodo);
      await this.onSettled();
      return result;
    } catch (err) {
      this.onError(context);
      await this.onSettled();
      throw err;
    }
  }
}

export { OptimisticTodoMutationHandler, TODOS_QUERY_KEY };
export type { QueryFilters, QueryCacheClient, TodoItem, MutationContext };
