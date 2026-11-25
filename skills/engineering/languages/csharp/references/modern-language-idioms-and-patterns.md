# Modern C# Language Idioms & Pattern Architecture

This reference outlines language standards, type system invariants, and expressive constructs in C# 12 and C# 13.

---

## 1. Primary Constructors

Primary constructors simplify dependency injection, immutable records, and domain value objects by integrating parameter declarations directly into class and struct signatures.

### Dependency Injection Pattern
```csharp
public sealed class OrderProcessor(
    IOrderRepository repository,
    IPaymentGateway gateway,
    ILogger<OrderProcessor> logger)
{
    public async Task ProcessAsync(Guid orderId, CancellationToken ct)
    {
        logger.LogInformation("Processing order {OrderId}", orderId);
        var order = await repository.GetByIdAsync(orderId, ct);
        await gateway.ChargeAsync(order.TotalAmount, ct);
    }
}
```

---

## 2. Immutability with Records, Required, and Init

Eliminate partially constructed states, null pointer exceptions, and defensive constructor overloads.

### Immutable Domain Entities
```csharp
public sealed record CustomerAccount
{
    public required Guid Id { get; init; }
    public required string Email { get; init; }
    public required string TenantId { get; init; }
    public decimal Balance { get; init; } = 0.00m;
}
```

---

## 3. Collection Expressions & Spread Operator

C# 12 introduces unified collection literals (`[...]`), replacing disparate constructors (`new List<T>()`, `new T[]`, `ImmutableArray.Create()`).

### Syntax and Spread Operations
```csharp
ReadOnlySpan<string> fallbackEndpoints = ["us-east-1.internal", "us-west-2.internal"];
List<string> primaryEndpoints = ["eu-west-1.internal"];

string[] mergedEndpoints = [.. primaryEndpoints, .. fallbackEndpoints, "edge-relay.internal"];
```

---

## 4. Discriminated Unions via Closed Record Hierarchies

While native language-level discriminated unions are scheduled for future C# versions, production C# models closed sum types via abstract records with private constructors. Because the Roslyn compiler does not yet prove exhaustiveness across `abstract record` subtypes (emitting warning `CS8509`), terminate the switch expression with `UnreachableException` rather than silently returning a default value:

### Closed State Machine
```csharp
using System.Diagnostics;

public abstract record OrderState
{
    private OrderState() {}
    public sealed record Pending(DateTime CreatedAt) : OrderState;
    public sealed record Processing(Guid WorkerId, DateTime StartedAt) : OrderState;
    public sealed record Completed(Guid InvoiceId, DateTime SettledAt) : OrderState;
    public sealed record Failed(string ErrorCode, string Reason) : OrderState;
}
```

### Pattern Matching Switch with Unreachable Guard
```csharp
public static string FormatStateSummary(OrderState state) => state switch
{
    OrderState.Pending p => $"Order pending since {p.CreatedAt:s}",
    OrderState.Processing pr => $"Processing under worker {pr.WorkerId}",
    OrderState.Completed c => $"Settled under invoice {c.InvoiceId}",
    OrderState.Failed f => $"Aborted with code {f.ErrorCode}: {f.Reason}",
    _ => throw new UnreachableException($"Unhandled order state: {state}")
};
```

---

## 5. Backing Fields and Validation Properties (C# 13 vs C# 14)

In **C# 13** (`<LangVersion>13.0</LangVersion>`), property setters that normalize or validate inputs require an explicit private backing field (`field` was preview-only in C# 13 and emits `CS9260` unless `<LangVersion>preview</LangVersion>` or **C# 14 / .NET 10** is enabled):

```csharp
public sealed class UserProfile
{
    private string _displayName = string.Empty;

    public string DisplayName
    {
        get => _displayName;
        set => _displayName = string.IsNullOrWhiteSpace(value)
            ? throw new ArgumentException("Display name cannot be empty.", nameof(value))
            : value.Trim();
    }
}
```

When targeting **C# 14 (.NET 10+)**, the contextual `field` keyword eliminates the explicit `_displayName` field declaration:

```csharp
public sealed class UserProfileCSharp14
{
    public string DisplayName
    {
        get;
        set => field = string.IsNullOrWhiteSpace(value)
            ? throw new ArgumentException("Display name cannot be empty.", nameof(value))
            : value.Trim();
    } = string.Empty;
}
```
