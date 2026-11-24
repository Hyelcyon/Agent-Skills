---
name: java
description: Use when building or optimizing modern Java applications (Java 21 LTS - Java 25 LTS), utilizing Project Loom virtual threads, structured concurrency, scoped values, record patterns, sealed hierarchies, or strict JVM build tooling.
---

# Modern Java Senior Engineering (Java 21 LTS - Java 25 LTS)

Senior engineering standards and idioms for high-throughput, memory-efficient JVM services, emphasizing Project Loom virtual threads, StructuredTaskScope, ScopedValue, pattern matching with record deconstruction, and sealed hierarchies.

## When to Use
- Building concurrent backend services leveraging Virtual Threads (Project Loom).
- Orchestrating parallel asynchronous subtasks using `StructuredTaskScope`.
- Managing immutable execution context across thread boundaries with `ScopedValue`.
- Designing domain models with sealed interfaces, records, and pattern matching switch expressions.
- Configuring strict Maven or Gradle enterprise build tooling targeting Java 21+.

## When NOT to Use
- Legacy Java 8/11 maintenance where virtual threads or record patterns are unsupported.
- Android platform development using Android D8/R8 bytecode runtimes.
- Kotlin or Scala JVM applications (use respective language skills).

---

## 5-Phase Agent Operational Protocol

```
Phase 1: Toolchain & Compiler Baseline Verification (Java 21+)
Phase 2: Concurrency Architecture Selection (Virtual Threads vs Platform Pool)
Phase 3: Domain Modeling with Records & Sealed Hierarchies
Phase 4: Structured Concurrency & Scoped Context Lifecycles
Phase 5: Quality Gate & Verification (Spotless, Checkstyle, JUnit 5)
```

### Phase 1: Toolchain & Compiler Baseline
Verify toolchain targets Java 21 LTS or newer. Enable strict compiler warnings with `-Werror` and `-Xlint:all`.

### Phase 2: Concurrency Architecture Selection
Adopt the thread-per-task model for I/O-bound workloads using `Executors.newVirtualThreadPerTaskExecutor()`. Never pool virtual threads. Avoid pinning carrier threads by replacing `synchronized` blocks around blocking calls with `ReentrantLock`.

### Phase 3: Domain Modeling with Records & Pattern Matching
Model immutable data as records and state machines as sealed hierarchies:
```java
public sealed interface OrderStatus permits Pending, Approved, Shipped {}
public record Order(UUID id, OrderStatus status) {}
```
Deconstruct records directly in switch expressions without manual casting:
```java
return switch (status) {
    case Pending() -> handlePending();
    case Approved() -> handleApproved();
    case Shipped() -> handleShipped();
};
```

### Phase 4: Structured Concurrency & Scoped Values
Coordinate subtasks with `StructuredTaskScope` (Preview feature: requires `--enable-preview`) to eliminate thread leaks and propagate cancellation:
```java
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    StructuredTaskScope.Subtask<User> user = scope.fork(() -> fetchUser(id));
    StructuredTaskScope.Subtask<Account> account = scope.fork(() -> fetchAccount(id));
    scope.join().throwIfFailed();
    return new Profile(user.get(), account.get());
}
```
Bind thread-safe, immutable context with `ScopedValue` instead of mutable `ThreadLocal`.

### Phase 5: Quality Gate & Verification
Execute automated tests and enforce static analysis:
```bash
mvn clean verify
./gradlew check
```

---

## Prohibited Anti-Patterns

- ❌ Pooling virtual threads with thread pools (e.g. `Executors.newFixedThreadPool` with virtual threads).
- ❌ Using `synchronized` blocks around blocking I/O calls (causes carrier thread pinning).
- ❌ Using mutable `ThreadLocal` for request context when `ScopedValue` is available.
- ❌ Orphaned asynchronous tasks via unbounded `CompletableFuture.runAsync()`.
- ❌ Fallback `default` branches in sealed class switch statements that defeat compiler exhaustiveness checks.
- ❌ Modifying collection parameters or returning mutable internal state from domain records.

---

## References & Documentation
- Virtual Threads & Loom Architecture: [references/virtual-threads-and-loom-architecture.md](./references/virtual-threads-and-loom-architecture.md)
- Structured Concurrency & Scoped Values: [references/structured-concurrency-and-scoped-values.md](./references/structured-concurrency-and-scoped-values.md)
- Pattern Matching & Record Patterns: [references/pattern-matching-and-record-patterns.md](./references/pattern-matching-and-record-patterns.md)

## Resources & Examples
- Strict Maven POM: [resources/pom.strict.xml](./resources/pom.strict.xml)
- Strict Gradle Build Script: [resources/build.gradle.kts](./resources/build.gradle.kts)
- Checkstyle Ruleset: [resources/checkstyle.xml](./resources/checkstyle.xml)
- Virtual Thread Worker Pool: [examples/VirtualThreadWorkerPool.java](./examples/VirtualThreadWorkerPool.java)
- Structured Task Pipeline: [examples/StructuredTaskPipeline.java](./examples/StructuredTaskPipeline.java)
- Record Pattern Dispatcher: [examples/RecordPatternDispatcher.java](./examples/RecordPatternDispatcher.java)
