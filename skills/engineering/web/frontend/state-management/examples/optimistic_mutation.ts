interface QueryCacheClient<TData> {
  cancelQueries(queryKey: readonly string[]): Promise<void>;
  getQueryData(queryKey: readonly string[]): TData | undefined;
  setQueryData(queryKey: readonly string[], updater: (old: TData | undefined) => TData): void;
  invalidateQueries(queryKey: readonly string[]): Promise<void>;
}

interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
}

interface MutationContext<TData> {
  previousData?: TData;
}

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

  async onMutate(updatedTodo: TodoItem): Promise<MutationContext<TodoItem[]>> {
    const queryKey = ['todos'] as const;

    await this.queryClient.cancelQueries(queryKey);

    const previousData = this.queryClient.getQueryData(queryKey);

    this.queryClient.setQueryData(queryKey, (old = []) =>
      old.map((item) => (item.id === updatedTodo.id ? { ...item, ...updatedTodo } : item))
    );

    return { previousData };
  }

  onError(context?: MutationContext<TodoItem[]>): void {
    const queryKey = ['todos'] as const;
    if (context?.previousData) {
      this.queryClient.setQueryData(queryKey, () => context.previousData!);
    }
  }

  async onSettled(): Promise<void> {
    await this.queryClient.invalidateQueries(['todos']);
  }

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

export { OptimisticTodoMutationHandler };
export type { QueryCacheClient, TodoItem, MutationContext };
