# Modern Python Concurrency and AsyncIO Architecture

High-throughput, resilient concurrency patterns in modern Python 3.12 and 3.13, focusing on structured concurrency, exception groups, background worker pipelines, and free-threaded execution safety.

## 1. Structured Concurrency with TaskGroup

Traditional asynchronous workflows relying on `asyncio.gather()` often leave unhandled background tasks running as orphans when one task raises an exception. Python 3.11+ `asyncio.TaskGroup` ensures all spawned child tasks either complete successfully or get cancelled deterministically upon failure.

```python
import asyncio

async def fetch_metrics(source: str) -> dict[str, int]:
    await asyncio.sleep(0.05)
    return {source: 42}

async def collect_cluster_metrics() -> list[dict[str, int]]:
    results: list[dict[str, int]] = []
    async with asyncio.TaskGroup() as tg:
        tasks = [
            tg.create_task(fetch_metrics("node-1")),
            tg.create_task(fetch_metrics("node-2")),
            tg.create_task(fetch_metrics("node-3")),
        ]
    for task in tasks:
        results.append(task.result())
    return results
```

If any task inside the context block raises an exception, the remaining active tasks are immediately cancelled, preventing leaked coroutines and dangling network sockets.

---

## 2. Handling Multiple Failures with ExceptionGroup

When multiple concurrent tasks fail inside a `TaskGroup`, Python bundles the individual errors into an `ExceptionGroup`. Handle them using `except*` syntax:

```python
import asyncio

async def failing_worker(name: str) -> None:
    await asyncio.sleep(0.01)
    if name == "db":
        raise ConnectionResetError("Database connection lost")
    if name == "cache":
        raise TimeoutError("Redis ping timeout")

async def run_pipeline() -> list[str]:
    failures: list[str] = []
    try:
        async with asyncio.TaskGroup() as tg:
            tg.create_task(failing_worker("db"))
            tg.create_task(failing_worker("cache"))
    except* ConnectionResetError as eg:
        failures.extend(f"connection:{err}" for err in eg.exceptions)
    except* TimeoutError as eg:
        failures.extend(f"timeout:{err}" for err in eg.exceptions)
    return failures
```

The `except*` syntax enables granular matching across heterogeneous exception trees, allowing selective remediation and clean error logging.

---

## 3. Resilient Producer-Consumer Worker Queues

For background job execution and rate-limited API consumption, decouple ingestion from execution with `asyncio.Queue`:

```python
import asyncio

async def worker(queue: asyncio.Queue[str], sink: list[str]) -> None:
    while True:
        item = await queue.get()
        try:
            sink.append(item.upper())
        finally:
            queue.task_done()

async def run_queue_pipeline() -> list[str]:
    queue: asyncio.Queue[str] = asyncio.Queue(maxsize=100)
    processed_items: list[str] = []
    
    workers = [
        asyncio.create_task(worker(queue, processed_items))
        for _ in range(4)
    ]
    
    for payload in ["item-a", "item-b", "item-c"]:
        await queue.put(payload)
        
    await queue.join()
    
    for w in workers:
        w.cancel()
    await asyncio.gather(*workers, return_exceptions=True)
    
    return processed_items
```

Bounded queues (`maxsize`) provide immediate backpressure against producer spikes, preventing memory exhaustion.

---

## 4. Free-Threaded (No-GIL) Multi-Threading (Python 3.13+)

Python 3.13 introduces experimental free-threaded builds (`python3.13t`) allowing true multi-core parallel execution across threads without the Global Interpreter Lock.

### Memory Safety and Synchronization Rules

1. **Shared Mutable State**: Built-in collections (`list`, `dict`, `set`) are memory safe from internal crashes, but sequence operations (such as check-then-act) are not atomic.
2. **Explicit Locks**: Protect shared structures with `threading.Lock` or `threading.RLock`.
3. **Immutable Sharing**: Prefer immutable data models (`@dataclass(frozen=True)` or Pydantic `frozen=True`) when passing data across worker threads to eliminate lock contention.
