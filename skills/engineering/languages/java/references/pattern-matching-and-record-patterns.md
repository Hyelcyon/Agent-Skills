# Modern Java Pattern Matching, Sealed Types, and Record Patterns

Engineering standards for domain modeling using sealed hierarchies, record patterns, and exhaustive pattern matching in modern Java.

## 1. Domain Modeling with Sealed Interfaces and Records

Combining sealed interfaces with Java records provides algebraic data types (ADTs) natively in Java, making illegal domain states unrepresentable at compile time.

```java
package com.enterprise.domain;

public sealed interface TransactionEvent
    permits TransactionEvent.Authorized, TransactionEvent.Declined, TransactionEvent.Refunded {

    record Authorized(String txId, long amountCents, String authCode) implements TransactionEvent {}
    record Declined(String txId, String failureReason) implements TransactionEvent {}
    record Refunded(String txId, long amountCents, String originalTxId) implements TransactionEvent {}
}
```

Because all implementations of `TransactionEvent` are sealed, the Java compiler enforces exhaustive checking in `switch` expressions without requiring a fallback `default` branch.

---

## 2. Deconstructing Data via Record Patterns

Record patterns deconstruct component fields directly in `instanceof` checks and `switch` cases, eliminating manual accessor calls and type casts:

```java
package com.enterprise.domain;

public class EventProcessor {
    public static String formatEvent(TransactionEvent event) {
        return switch (event) {
            case TransactionEvent.Authorized(var id, var amount, var code) when amount > 100000 ->
                "High value authorized: " + id + " [" + amount + " cents, code=" + code + "]";
            case TransactionEvent.Authorized(var id, var amount, var code) ->
                "Authorized: " + id + " [" + amount + " cents]";
            case TransactionEvent.Declined(var id, var reason) ->
                "Declined: " + id + " due to " + reason;
            case TransactionEvent.Refunded(var id, var amount, var origId) ->
                "Refunded: " + id + " for original tx " + origId;
        };
    }
}
```

The guard condition `when amount > 100000` evaluates predicate logic directly in the match pattern without nested `if` statements.

---

## 3. Nested Record Pattern Deconstruction

Record patterns can deconstruct nested data structures in a single declarative expression:

```java
package com.enterprise.domain;

public class GeometryAnalytics {
    public record Point(double x, double y) {}
    public record Circle(Point center, double radius) {}

    public static boolean isOriginCentered(Object shape) {
        return shape instanceof Circle(Point(double x, double y), double r) && x == 0.0 && y == 0.0;
    }
}
```

The inner `Point(double x, double y)` pattern unpacks the nested coordinates directly into local scope variables.
