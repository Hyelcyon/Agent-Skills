interface TaskPayload {
  id: string;
  data: string;
}

interface WorkerState {
  isProcessing: boolean;
  isShuttingDown: boolean;
  completedTasks: number;
}

class ResilientTaskWorker {
  private state: WorkerState = {
    isProcessing: false,
    isShuttingDown: false,
    completedTasks: 0
  };

  private queue: TaskPayload[] = [];

  enqueue(task: TaskPayload): boolean {
    if (this.state.isShuttingDown) {
      return false;
    }
    this.queue.push(task);
    return true;
  }

  async processNext(): Promise<TaskPayload | null> {
    if (this.queue.length === 0 || this.state.isProcessing) {
      return null;
    }

    const task = this.queue.shift();
    if (!task) return null;

    this.state.isProcessing = true;
    try {
      await this.executeTask(task);
      this.state.completedTasks += 1;
      return task;
    } finally {
      this.state.isProcessing = false;
    }
  }

  private async executeTask(task: TaskPayload): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    if (task.data === 'FORCE_ERROR') {
      throw new Error(`Task execution failed for ${task.id}`);
    }
  }

  async shutdown(): Promise<number> {
    this.state.isShuttingDown = true;
    while (this.state.isProcessing) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    return this.state.completedTasks;
  }

  getStatus(): Readonly<WorkerState> {
    return { ...this.state };
  }
}

export { ResilientTaskWorker, type TaskPayload, type WorkerState };
