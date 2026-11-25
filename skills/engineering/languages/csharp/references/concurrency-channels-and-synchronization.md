# Concurrency, Channels & Synchronization Engineering

This reference defines thread safety, asynchronous pipeline design, and synchronization standards for modern .NET services.

---

## 1. System.Threading.Lock (.NET 9+ / C# 13)

Prior to C# 13 and .NET 9, synchronization relied on `Monitor.Enter` / `Monitor.Exit` over arbitrary reference objects (`lock (new object())`), which suffered from overhead and accidental lock-target mutation. `.NET 9+` introduces `System.Threading.Lock`; the field must be typed as `Lock` (not `object`) so the C# 13 compiler lowers `lock (_syncLock)` to `Lock.EnterScope()`. Projects multi-targeting `net8.0;net9.0` must guard usage with `#if NET9_0_OR_GREATER` or target `net9.0+`.

### Dedicated Lock Syntax
```csharp
public sealed class ThreadSafeRegistry
{
    private readonly System.Threading.Lock _syncLock = new();
    private readonly Dictionary<string, string> _state = [];

    public void Register(string key, string value)
    {
        lock (_syncLock)
        {
            _state[key] = value;
        }
    }

    public bool TryLookup(string key, out string? value)
    {
        lock (_syncLock)
        {
            return _state.TryGetValue(key, out value);
        }
    }
}
```

---

## 2. Lock-Free Pipelines with System.Threading.Channels

For high-throughput producer-consumer systems (e.g. log dispatchers, event ingestion, background queue workers), use bounded `Channel<T>` over legacy `BlockingCollection<T>` or unbounded queues.

### Bounded Channel Configuration
Always bound channel capacity to prevent out-of-memory errors during downstream backpressure:

```csharp
public sealed class EventDispatcher<T>
{
    private readonly Channel<T> _channel = Channel.CreateBounded<T>(new BoundedChannelOptions(10_000)
    {
        FullMode = BoundedChannelFullMode.Wait,
        SingleReader = false,
        SingleWriter = false
    });

    public ValueTask PublishAsync(T item, CancellationToken ct)
    {
        return _channel.Writer.WriteAsync(item, ct);
    }

    public IAsyncEnumerable<T> ConsumeAllAsync(CancellationToken ct)
    {
        return _channel.Reader.ReadAllAsync(ct);
    }
}
```

---

## 3. Streaming with IAsyncEnumerable and Cancellation

Never accumulate entire remote result sets into in-memory collections (`List<T>`). Stream records reactively with `IAsyncEnumerable<T>` and propagate `CancellationToken` using `[EnumeratorCancellation]`.

### Streaming Data Producer
```csharp
public async IAsyncEnumerable<AuditRecord> StreamAuditLogsAsync(
    DateTime since,
    [EnumeratorCancellation] CancellationToken ct = default)
{
    using var reader = await ExecuteDatabaseQueryAsync(since, ct);
    while (await reader.ReadAsync(ct))
    {
        yield return MapRecord(reader);
    }
}
```

---

## 4. Preventing Thread Pool Starvation

Thread pool starvation occurs when asynchronous operations are synchronously blocked, holding thread-pool worker threads hostage and cascading into high latency.

### Prohibited Blocking & Lifetime Violations
- ❌ `task.Result` / `task.Wait()` / `task.GetAwaiter().GetResult()`
- ❌ `Task.Run(...).Wait()`
- ❌ Awaiting a `ValueTask` / `ValueTask<T>` more than once or concurrently (call `.AsTask()` if shared)

### Correct Asynchronous Idioms
- ✅ Always use `await` inside async methods.
- ✅ Configure background workers with `Task.Run` only for CPU-bound computations, never for blocking I/O calls.
- ✅ Always accept and propagate `CancellationToken` (and guard cancellation boundaries via `ct.ThrowIfCancellationRequested()`).
