interface SchedulerGlobal {
  yield?: () => Promise<void>;
  postTask?: <T>(callback: () => T | Promise<T>, options?: { priority?: 'user-blocking' | 'user-visible' | 'background' }) => Promise<T>;
}

async function yieldToMainThread(): Promise<void> {
  const customGlobal = globalThis as unknown as { scheduler?: SchedulerGlobal };

  if (typeof customGlobal.scheduler?.yield === 'function') {
    return customGlobal.scheduler.yield();
  }

  return new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
}

async function processArrayInChunks<T, R>(
  items: readonly T[],
  transform: (item: T) => R,
  maxContinuousTimeMs: number = 16
): Promise<R[]> {
  const results: R[] = [];
  let chunkStartTime = performance.now();

  for (let i = 0; i < items.length; i++) {
    results.push(transform(items[i]));

    if (performance.now() - chunkStartTime > maxContinuousTimeMs) {
      await yieldToMainThread();
      chunkStartTime = performance.now();
    }
  }

  return results;
}

export { yieldToMainThread, processArrayInChunks };
export type { SchedulerGlobal };
