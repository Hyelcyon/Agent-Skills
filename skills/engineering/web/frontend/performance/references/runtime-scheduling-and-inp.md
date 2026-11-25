# Runtime Task Scheduling and INP Optimization

Engineering standards for sub-200ms Interaction to Next Paint (INP) using `scheduler.yield()` and prioritized task scheduling.

---

## 1. INP Anatomy: Understanding Interaction Latency

Interaction to Next Paint (INP) measures the worst-case interaction latency across a user's entire session:
$$\text{INP} = \text{Input Delay} + \text{Processing Duration} + \text{Presentation Delay}$$

### Targets
- **Good**: $\le 200\text{ms}$
- **Needs Improvement**: $200\text{ms} - 500\text{ms}$
- **Poor**: $> 500\text{ms}$

A Long Task is any JavaScript execution on the main thread that blocks execution for $> 50\text{ms}$. Long Tasks inflate Input Delay and Processing Duration.

---

## 2. Yielding to the Main Thread: `scheduler.yield()`

`scheduler.yield()` allows an asynchronous operation to break up monolithic loops, giving the browser opportunity to process pending input events and render frame updates:

```typescript
export async function yieldToMain(): Promise<void> {
  const globalScheduler = (
    globalThis as unknown as { scheduler?: { yield?: () => Promise<void> } }
  ).scheduler;

  if (typeof globalScheduler?.yield === 'function') {
    return globalScheduler.yield();
  }

  return new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => resolve();
    channel.port2.postMessage(null);
  });
}
```

### Chunking Monolithic Loops
```typescript
export async function processBatchItems<T>(
  items: readonly T[],
  processFn: (item: T) => void
): Promise<void> {
  let startDeadline = performance.now();

  for (const item of items) {
    processFn(item);

    if (performance.now() - startDeadline > 16) {
      await yieldToMain();
      startDeadline = performance.now();
    }
  }
}
```

---

## 3. Prioritized Task Scheduling: `scheduler.postTask()`

Schedule tasks according to user urgency:

```typescript
interface TaskOptions {
  priority: 'user-blocking' | 'user-visible' | 'background';
}

export function scheduleTask<T>(
  taskFn: () => T,
  options: TaskOptions = { priority: 'user-visible' }
): Promise<T> {
  const schedulerObj = (globalThis as unknown as { scheduler?: { postTask: <R>(fn: () => R, opts: TaskOptions) => Promise<R> } }).scheduler;

  if (schedulerObj && typeof schedulerObj.postTask === 'function') {
    return schedulerObj.postTask(taskFn, options);
  }

  return new Promise((resolve) => {
    setTimeout(() => resolve(taskFn()), 0);
  });
}
```

---

## 4. Anti-Patterns That Destroy INP
- ❌ Running heavy synchronous calculations directly inside event handlers (`onclick`, `onkeydown`).
- ❌ Relying on `requestIdleCallback` for user-triggered mutations (can be starved under continuous activity).
- ❌ Triggering layout thrashing by reading geometric properties (`offsetWidth`, `clientHeight`) immediately after DOM mutations.
