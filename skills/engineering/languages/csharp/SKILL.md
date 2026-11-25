---
name: csharp
description: Use when building, refactoring, or optimizing modern C# applications (C# 12 / C# 13, .NET 8 LTS / .NET 9), leveraging Span<T>, Memory<T>, Channels, Native AOT, primary constructors, collection expressions, pattern matching, or strict MSBuild configurations.
---

# Modern C# Senior Engineering (C# 12 / C# 13, .NET 8 LTS / .NET 9)

Senior engineering standards and idioms for high-throughput, memory-efficient services, zero-allocation buffers, fearless asynchronous concurrency, and type-safe domain modeling in modern C#.

## When to Use
- Building cloud-native microservices, minimal APIs, and event-driven backends on .NET 8 LTS or .NET 9.
- Implementing zero-allocation hot paths using `Span<T>`, `ReadOnlySpan<T>`, `Memory<T>`, and `ArrayPool<T>.Shared`.
- Designing lock-free producer-consumer concurrency pipelines using `System.Threading.Channels` and `IAsyncEnumerable<T>`.
- Modeling immutable domains with primary constructors, records, sealed hierarchies, and pattern matching switch expressions.
- Configuring Native AOT (`PublishAot=true`) and reflection-free `System.Text.Json` source generators.
- Enforcing strict Roslyn analyzer rules, `<Nullable>enable</Nullable>`, and `<TreatWarningsAsErrors>true</TreatWarningsAsErrors>`.

## When NOT to Use
- Legacy .NET Framework (4.x) maintenance without modern C# 12+ runtime features.
- High-level frontend browser client development (use `typescript`, `react`, `vue`, or `nextjs`).

---

## 5-Phase Agent Operational Protocol

```
Phase 1: Toolchain & Compiler Baseline Verification (.NET 8/9, Nullable, WarningsAsErrors)
Phase 2: Memory Budgeting & Zero-Allocation Path (Span<T>, ArrayPool<T>, ValueTask<T>)
Phase 3: Domain Modeling with Primary Constructors & Sealed Hierarchies
Phase 4: Non-Blocking Concurrency & Channel Pipelines (Lock, Channels, CancellationToken)
Phase 5: Quality Gate & Static Proof (dotnet build -warnaserror, audit_csharp_manifests.py)
```

### Phase 1: Toolchain & Compiler Baseline
Verify project targets .NET 8.0 or .NET 9.0 with `LangVersion` 12 or 13. Enforce strict compiler boundaries in `Directory.Build.props`:
```xml
<Nullable>enable</Nullable>
<TreatWarningsAsErrors>true</TreatWarningsAsErrors>
<AnalysisMode>AllEnabledByDefault</AnalysisMode>
<EnforceCodeStyleInBuild>true</EnforceCodeStyleInBuild>
```

### Phase 2: Memory Budgeting & Zero-Allocation
Avoid string allocations on hot paths. Replace `.Substring()` with `ReadOnlySpan<char>` slicing and use `params ReadOnlySpan<T>` (C# 13). Rent large buffers from `ArrayPool<T>.Shared` within `try-finally` blocks and slice to the exact byte count (`Rent(n)` may return a larger array). Return `ValueTask<T>` when operations frequently complete synchronously.

### Phase 3: Domain Modeling with Records & Pattern Matching
Construct immutable domain models with primary constructors, `required`, and `init` properties. Model closed discriminated unions via an abstract record with a private constructor, and include an `UnreachableException` discard arm because C# emits `CS8509` on `abstract record` switches:
```csharp
using System.Diagnostics;

public abstract record OrderState
{
    private OrderState() {}
    public sealed record Pending(DateTime CreatedAt) : OrderState;
    public sealed record Settled(Guid InvoiceId) : OrderState;
}

public static string Describe(OrderState state) => state switch
{
    OrderState.Pending p => $"Pending since {p.CreatedAt:s}",
    OrderState.Settled s => $"Settled under invoice {s.InvoiceId}",
    _ => throw new UnreachableException($"Unhandled order state: {state}")
};
```

### Phase 4: Non-Blocking Concurrency & Channels
On `.NET 9+`, replace legacy `lock (new object())` with an explicit `System.Threading.Lock` field (`private readonly Lock _sync = new();` — typing it as `object` defeats compiler `EnterScope()` lowering, and multi-targeted `net8.0;net9.0` builds require `#if NET9_0_OR_GREATER`). Construct bounded pipelines using `Channel.CreateBounded<T>`, propagate `CancellationToken`, and avoid `async void` outside top-level event handlers.

### Phase 5: Quality Gate & Verification
Execute automated static analysis, formatting, and unit tests:
```bash
dotnet build --configuration Release
dotnet test --no-build
python skills/engineering/languages/csharp/scripts/audit_csharp_manifests.py --path .
```

---

## Prohibited Anti-Patterns

- ❌ Synchronous blocking on async tasks via `.Result`, `.Wait()`, or `.GetAwaiter().GetResult()` (causes thread pool starvation).
- ❌ Allocating strings via `.Substring()` or LINQ `.Skip().Take()` in parsing hot paths (use `Span<T>`).
- ❌ Awaiting a `ValueTask<T>` multiple times or concurrently.
- ❌ Unbounded memory queues without backpressure (use bounded `Channel<T>`).
- ❌ Dynamic reflection in serialization when targeting Native AOT (use `[JsonSerializable]`).
- ❌ Bypassing exhaustiveness in closed `abstract record` switch expressions with silent fallback defaults instead of an `UnreachableException` guard (`CS8509`).
- ❌ Suppressing nullable warnings with indiscriminate `!` null-forgiving operators without runtime validation.

---

## References & Documentation
- Memory Architecture & Zero-Allocation: [references/memory-and-zero-allocation.md](./references/memory-and-zero-allocation.md)
- Modern Language Idioms & Patterns: [references/modern-language-idioms-and-patterns.md](./references/modern-language-idioms-and-patterns.md)
- Concurrency, Channels & Synchronization: [references/concurrency-channels-and-synchronization.md](./references/concurrency-channels-and-synchronization.md)

## Resources & Examples
- Strict Directory.Build.props: [resources/Directory.Build.props](./resources/Directory.Build.props)
- Roslyn EditorConfig: [resources/.editorconfig](./resources/.editorconfig)
- Strict AppSettings Schema: [resources/appsettings.strict.json](./resources/appsettings.strict.json)
- Zero-Allocation Buffer Parser: [examples/ZeroAllocationBufferParser.cs](./examples/ZeroAllocationBufferParser.cs)
- Channel Producer-Consumer Pipeline: [examples/ChannelProducerConsumerPipeline.cs](./examples/ChannelProducerConsumerPipeline.cs)
- Domain Record Pattern Dispatcher: [examples/DomainRecordPatternDispatcher.cs](./examples/DomainRecordPatternDispatcher.cs)
