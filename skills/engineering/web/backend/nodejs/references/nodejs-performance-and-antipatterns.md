# Node.js Performance Profiling and Anti-Patterns

A technical guide to Node.js event loop diagnostics, CPU offloading with Worker Threads, and the Top 10 backend anti-patterns.

---

## 1. Event Loop Lag Diagnostics

Monitor event loop delay to detect CPU-bound operations freezing incoming traffic:

```typescript
import { monitorEventLoopDelay } from 'node:perf_hooks';

export function createEventLoopMonitor() {
  const histogram = monitorEventLoopDelay({ resolution: 20 });
  histogram.enable();

  return {
    getStats() {
      return {
        minMs: (histogram.min / 1_000_000).toFixed(2),
        maxMs: (histogram.max / 1_000_000).toFixed(2),
        meanMs: (histogram.mean / 1_000_000).toFixed(2),
        p99Ms: (histogram.percentile(99) / 1_000_000).toFixed(2)
      };
    },
    disable() {
      histogram.disable();
    }
  };
}
```

---

## 2. Offloading CPU-Bound Tasks: `node:worker_threads`

Never run cryptographic mining, large image processing, or heavy data crunching on the primary event loop thread. Delegate to worker threads:

```typescript
import { Worker } from 'node:worker_threads';

export function runWorkerTask<TInput, TOutput>(workerScriptPath: string, payload: TInput): Promise<TOutput> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(workerScriptPath, {
      workerData: payload
    });

    worker.on('message', (result: TOutput) => {
      resolve(result);
    });

    worker.on('error', (err) => {
      reject(err);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}
```

---

## 3. Top 10 Node.js Anti-Patterns

### 1. Synchronous I/O in Request Handlers
- ❌ **Anti-Pattern**: Using `fs.readFileSync()` or `fs.writeFileSync()` inside HTTP request routes.
- ✅ **The Senior Fix**: Always use asynchronous promises: `import { readFile } from 'node:fs/promises'`.

### 2. Unsanitized Child Process Execution
- ❌ **Anti-Pattern**: Passing user strings to `child_process.exec(cmd)`.
- ✅ **The Senior Fix**: Use `child_process.execFile()` or `spawn()` with an array of arguments, or enforce the Node.js Permission Model.

### 3. Missing Unhandled Rejection Listeners
- ❌ **Anti-Pattern**: Ignoring unhandled asynchronous errors, leading to sudden process crashes.
- ✅ **The Senior Fix**: Register global safety traps and initiate graceful shutdown:
  ```typescript
  process.on('unhandledRejection', (reason) => {
    process.exit(1);
  });
  ```

### 4. Lingering Background Timers
- ❌ **Anti-Pattern**: Creating `setInterval()` loops that block Node.js from exiting cleanly.
- ✅ **The Senior Fix**: Call `.unref()` on non-critical background intervals:
  ```typescript
  const timer = setInterval(flushLogs, 10000);
  timer.unref();
  ```

### 5. Memory Leak via Unbounded Event Listeners
- ❌ **Anti-Pattern**: Calling `.on('event', handler)` repeatedly inside per-request callbacks without removing listeners.
- ✅ **The Senior Fix**: Use `{ once: true }` or `AbortSignal` with `events.on()`.

### 6. Mixing CommonJS and ESM Incoherently
- ❌ **Anti-Pattern**: Using `require()` and `module.exports` in modern TypeScript/ESM projects.
- ✅ **The Senior Fix**: Standardize on `"type": "module"` and native `import`/`export`.

### 7. Global Prototype Pollution
- ❌ **Anti-Pattern**: Modifying built-in JavaScript prototypes (`Object.prototype.customMethod = ...`).
- ✅ **The Senior Fix**: Use standalone utility functions or classes.

### 8. Catching Errors Without Propagation or Logging
- ❌ **Anti-Pattern**: Swallowing errors via empty catch blocks: `catch (e) {}`.
- ✅ **The Senior Fix**: Structured logging with error codes and contextual metadata.

### 9. Synchronous CPU Blocking in JSON Operations
- ❌ **Anti-Pattern**: Parsing multi-megabyte JSON payloads with `JSON.parse()` on the main thread.
- ✅ **The Senior Fix**: Stream with streaming JSON parsers or process in a Worker thread.

### 10. Granting Unrestricted File Access
- ❌ **Anti-Pattern**: Running Node.js microservices with root permissions and full filesystem access.
- ✅ **The Senior Fix**: Launch with `--permission --allow-fs-read="/app"`.
