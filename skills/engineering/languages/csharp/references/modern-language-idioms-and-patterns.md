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

While native language-level discriminated unions are scheduled for future C# versions, production C# achieves mathematical exhaustiveness via abstract records with private constructors and record deconstruction:

### Closed State Machine
```csharp
public abstract record OrderState
{
    private OrderState() {}
    public sealed record Pending(DateTime CreatedAt) : OrderState;
    public sealed record Processing(Guid WorkerId, DateTime StartedAt) : OrderState;
    public sealed record Completed(Guid InvoiceId, DateTime SettledAt) : OrderState;
    public sealed record Failed(string ErrorCode, string Reason) : OrderState;
}
```

### Exhaustive Pattern Matching Switch
Compile-time exhaustiveness prevents unhandled states without relying on fragile `default` fallback branches:

```csharp
public static string FormatStateSummary(OrderState state) => state switch
{
    OrderState.Pending p => $"Order pending since {p.CreatedAt:s}",
    OrderState.Processing pr => $"Processing under worker {pr.WorkerId}",
    OrderState.Completed c => $"Settled under invoice {c.InvoiceId}",
    OrderState.Failed f => $"Aborted with code {f.ErrorCode}: {f.Reason}"
};
```

---

## 5. Field-Backed Properties (C# 13)

C# 13 introduces the contextual `field` keyword, removing boilerplate private backing fields when adding mutation guards or normalization logic:

```csharp
public sealed class UserProfile
{
    public string DisplayName
    {
        get;
        set => field = string.IsNullOrWhiteSpace(value) 
            ? throw new ArgumentException("Display name cannot be empty.", nameof(value)) 
            : value.Trim();
    }
}
```
