'use client';

import { useOptimistic, useTransition, useState } from 'react';

interface Todo {
  id: string;
  text: string;
  sending?: boolean;
}

export function OptimisticTodoList({ initialTodos }: { initialTodos: Todo[] }) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [, startTransition] = useTransition();

  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newText: string) => [
      ...state,
      { id: `temp_${Date.now()}`, text: newText, sending: true }
    ]
  );

  async function handleAdd(formData: FormData) {
    const text = formData.get('todo') as string;
    if (!text?.trim()) return;

    startTransition(async () => {
      addOptimisticTodo(text);
      await new Promise((resolve) => setTimeout(resolve, 300));
      setTodos((prev) => [...prev, { id: `real_${Date.now()}`, text }]);
    });
  }

  return (
    <div>
      <form action={handleAdd}>
        <input name="todo" type="text" placeholder="Add task..." required />
        <button type="submit">Add Task</button>
      </form>

      <ul>
        {optimisticTodos.map((t) => (
          <li key={t.id} style={{ opacity: t.sending ? 0.5 : 1 }}>
            {t.text} {t.sending && '...'}
          </li>
        ))}
      </ul>
    </div>
  );
}
