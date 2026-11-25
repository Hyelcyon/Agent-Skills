# Structured Concurrency and Scoped Values Architecture (Java 21 / 25)

Engineering standards for coordinating concurrent subtasks as single units of work using StructuredTaskScope and managing lightweight contextual data with ScopedValue.

## 1. Structured Concurrency with StructuredTaskScope

Traditional asynchronous code using `CompletableFuture` executes subtasks in an unconstrained manner. If one task fails, other concurrent subtasks continue running as orphaned processes, wasting compute resources and leaving database transactions hanging.

`StructuredTaskScope` treats a family of concurrent tasks as a single coordinated unit of work. If any subtask fails, all sibling subtasks are automatically cancelled.

```java
package com.enterprise.concurrency;

import java.util.concurrent.StructuredTaskScope;
import java.util.concurrent.StructuredTaskScope.Joiner;

public class OrderAggregationService {
    public record OrderSnapshot(String userDetails, String paymentStatus) {}

    // Requires --enable-preview on Java 25 (JEP 505 replaces ShutdownOnFailure from JDK 21-24)
    public OrderSnapshot fetchOrderSummary(String orderId) throws Exception {
        try (var scope = StructuredTaskScope.open(Joiner.awaitAllSuccessfulOrThrow())) {
            StructuredTaskScope.Subtask<String> userTask = scope.fork(() -> fetchUser(orderId));
            StructuredTaskScope.Subtask<String> paymentTask = scope.fork(() -> fetchPayment(orderId));

            scope.join();

            return new OrderSnapshot(userTask.get(), paymentTask.get());
        } catch (StructuredTaskScope.FailedException e) {
            if (e.getCause() instanceof Exception cause) {
                throw cause;
            }
            throw e;
        }
    }

    private String fetchUser(String id) {
        return "User-Data";
    }

    private String fetchPayment(String id) {
        return "Payment-Confirmed";
    }
}
```

If `fetchUser` throws an exception, `Joiner.awaitAllSuccessfulOrThrow()` cancels sibling subtasks immediately and `scope.join()` throws `StructuredTaskScope.FailedException` wrapping the root cause.

---

## 2. Replacing ThreadLocal with ScopedValue

`ThreadLocal` variables suffer from architectural drawbacks when used with millions of virtual threads:
- Mutability: Any method can alter a `ThreadLocal` value at any point in the call stack.
- Memory Overhead: Child threads inheriting `InheritableThreadLocal` duplicate map references in heap memory.
- Lifecycle Leaks: Forgetting to call `remove()` leaks memory across long-lived threads.

`ScopedValue` provides immutable, bounded context propagation that is automatically collected upon exiting its binding scope:

```java
package com.enterprise.security;

public class SecurityContextHolder {
    public static final ScopedValue<String> CURRENT_USER_ID = ScopedValue.newInstance();

    public static void runAs(String userId, Runnable action) {
        ScopedValue.where(CURRENT_USER_ID, userId).run(action);
    }

    public static String getAuthenticatedUser() {
        return CURRENT_USER_ID.orElse("anonymous");
    }
}
```

Virtual threads spawned within the `ScopedValue.where(...).run(...)` block inherit access to `CURRENT_USER_ID` with zero copy overhead.
