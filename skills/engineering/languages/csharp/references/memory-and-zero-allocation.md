# Memory Architecture & Zero-Allocation Engineering

This reference provides memory safety, cache locality, and allocation-budgeting patterns for high-throughput C# applications targeting .NET 8 LTS and .NET 9.

---

## 1. Span, ReadOnlySpan, and Memory

`Span<T>` and `ReadOnlySpan<T>` provide type-safe, contiguous representations of arbitrary memory (managed heap arrays, stack-allocated buffers, or unmanaged native memory) without heap allocations.

### Stack Allocation and Slicing
Never use `string.Substring()` or LINQ `.Skip().Take()` on hot paths. Slice views directly with `ReadOnlySpan<char>`:

```csharp
public static bool TryParseHeader(ReadOnlySpan<char> input, out ReadOnlySpan<char> key, out ReadOnlySpan<char> value)
{
    int separatorIndex = input.IndexOf(':');
    if (separatorIndex < 0)
    {
        key = default;
        value = default;
        return false;
    }

    key = input[..separatorIndex].Trim();
    value = input[(separatorIndex + 1)..].Trim();
    return true;
}
```

### params ReadOnlySpan<T> (C# 13)
C# 13 eliminates the hidden heap array allocation inherent in traditional `params T[]` declarations:

```csharp
public void LogMetrics(params ReadOnlySpan<long> measurements)
{
    for (int i = 0; i < measurements.Length; i++)
    {
        RecordMetric(measurements[i]);
    }
}
```

---

## 2. ArrayPool and Buffer Management

When payloads exceed stack boundaries (`stackalloc`), rent from `ArrayPool<T>.Shared` to eliminate garbage collector Gen 0/1 pressure.

### Structured Rental Pattern
Always guard rented arrays with `try-finally`, loop on `Stream.Read(Span<byte>)` to prevent `CA2022` inexact reads and `CA1835` array overloads, and return buffers cleanly:

```csharp
public byte[] ProcessIncomingStream(Stream sourceStream, int estimatedSize)
{
    ArgumentNullException.ThrowIfNull(sourceStream);
    ArgumentOutOfRangeException.ThrowIfNegative(estimatedSize);

    byte[] rented = ArrayPool<byte>.Shared.Rent(estimatedSize);
    try
    {
        int totalRead = 0;
        while (totalRead < estimatedSize)
        {
            int bytesRead = sourceStream.Read(rented.AsSpan(totalRead, estimatedSize - totalRead));
            if (bytesRead == 0)
            {
                break;
            }
            totalRead += bytesRead;
        }
        return TransformBuffer(rented.AsSpan(0, totalRead));
    }
    finally
    {
        ArrayPool<byte>.Shared.Return(rented, clearArray: true);
    }
}
```

---

## 3. ValueTask vs Task Semantics

`Task<T>` is a reference type allocating at least 32 bytes on the managed heap. Use `ValueTask<T>` when an asynchronous operation frequently completes synchronously (e.g. cache hits or in-memory checks).

### The Invariants of ValueTask
1. **Never await twice**: A `ValueTask<T>` may wrap a pooled `IValueTaskSource<T>` that is recycled immediately upon completion. Awaiting multiple times triggers undefined behavior.
2. **Never await concurrently**: Concurrent awaits on the same `ValueTask<T>` race on the underlying `IValueTaskSource<T>`.
3. **Never call `.Result` or `.GetAwaiter().GetResult()`**: Synchronous blocking on an incomplete `ValueTask` is unsupported and corrupts pool state.
4. **Convert to `Task` if stored or shared**: Call `.AsTask()` (or `.Preserve()` when preserving a `ValueTask` before awaiting in one consumer) before caching or sharing across multiple awaiters.

```csharp
public ValueTask<SessionState> GetSessionAsync(Guid sessionId, CancellationToken ct)
{
    if (_inMemoryCache.TryGetValue(sessionId, out var session))
    {
        return ValueTask.FromResult(session);
    }

    return FetchFromDatabaseAsync(sessionId, ct);
}

private ValueTask<SessionState> FetchFromDatabaseAsync(Guid sessionId, CancellationToken ct) => ...;
```

---

## 4. Native AOT & Zero-Reflection Serialization

For containerized microservices and low-latency CLI tools, build applications targeting Native Ahead-of-Time compilation (`PublishAot=true`).

### System.Text.Json Source Generation
Dynamic reflection breaks trim trees and prevents Ahead-of-Time compilation. Use compile-time Roslyn source generation:

```csharp
[JsonSerializable(typeof(OrderRequest))]
[JsonSerializable(typeof(OrderResponse))]
[JsonSourceGenerationOptions(PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase, GenerationMode = JsonSourceGenerationMode.Default)]
public sealed partial class ApplicationJsonContext : JsonSerializerContext
{
}
```

Usage:
```csharp
byte[] utf8Json = JsonSerializer.SerializeToUtf8Bytes(response, ApplicationJsonContext.Default.OrderResponse);
```
