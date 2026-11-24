import React, { useActionState, useOptimistic, useRef } from 'react';

interface Task {
  id: string;
  title: string;
  pending?: boolean;
}

interface ActionState {
  tasks: Task[];
  error: string | null;
}

async function createTaskAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const title = formData.get('title') as string;
  if (!title || title.trim().length === 0) {
    return {
      tasks: prevState.tasks,
      error: 'Task title cannot be empty'
    };
  }

  const newTask: Task = {
    id: crypto.randomUUID(),
    title: title.trim()
  };

  return {
    tasks: [...prevState.tasks, newTask],
    error: null
  };
}

interface TaskListProps {
  initialTasks: Task[];
  inputRef?: React.Ref<HTMLInputElement>;
}

function ModernTaskForm({ initialTasks, inputRef }: TaskListProps) {
  const [state, formAction, isPending] = useActionState(createTaskAction, {
    tasks: initialTasks,
    error: null
  });

  const [optimisticTasks, addOptimisticTask] = useOptimistic(
    state.tasks,
    (current, newTitle: string) => [
      ...current,
      { id: 'temp-id', title: newTitle, pending: true }
    ]
  );

  const localInputRef = useRef<HTMLInputElement>(null);
  const resolvedRef = inputRef ?? localInputRef;

  const handleSubmit = (formData: FormData) => {
    const title = formData.get('title') as string;
    if (title && title.trim()) {
      addOptimisticTask(title.trim());
    }
    formAction(formData);
  };

  return (
    <section>
      <form action={handleSubmit}>
        <input
          ref={resolvedRef}
          name="title"
          placeholder="Enter new task"
          disabled={isPending}
        />
        <button type="submit" disabled={isPending}>
          {isPending ? 'Adding...' : 'Add Task'}
        </button>
      </form>

      {state.error && <p role="alert">{state.error}</p>}

      <ul>
        {optimisticTasks.map((task) => (
          <li key={task.id} style={{ opacity: task.pending ? 0.6 : 1 }}>
            {task.title} {task.pending ? '(Saving...)' : ''}
          </li>
        ))}
      </ul>
    </section>
  );
}

export { ModernTaskForm };
export type { Task, ActionState, TaskListProps };
