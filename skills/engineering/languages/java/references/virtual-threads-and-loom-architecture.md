# Virtual Threads and Project Loom Concurrency Architecture (Java 21 LTS / 25 LTS)

Architectural guidelines for high-throughput, concurrent service development using Java Virtual Threads, replacing reactive asynchronous pipelines with the thread-per-request model.

## 1. The Paradigm Shift: Platform Threads vs Virtual Threads

Historically, Java platform threads (`java.lang.Thread`) mapped 1:1 to operating system kernel threads:
- Each platform thread consumes approximately 1MB of native memory for its call stack.
- Operating system context switching between thousands of threads creates high CPU kernel overhead.
- High-throughput services were forced into complex reactive architectures (Project Reactor, RxJava) to avoid blocking platform threads.

Virtual threads are lightweight, user-mode threads managed directly by the Java Virtual Machine:
- Stack frames are stored in JVM heap memory and grow dynamically from hundreds of bytes.
- When a virtual thread executes a blocking I/O operation (socket read, JDBC query), the JVM unmounts it from its carrier platform thread.
- The carrier thread immediately executes other virtual threads without blocking operating system resources.

---

## 2. The Thread-per-Request Concurrency Model

Instead of managing bounded thread pools for I/O tasks, create an unpooled virtual thread executor:

```java
package com.enterprise.concurrency;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class VirtualThreadServer {
    public void processRequests(Iterable<Runnable> tasks) {
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            for (Runnable task : tasks) {
                executor.submit(task);
            }
        }
    }
}
```

The `try-with-resources` block automatically awaits the termination of all submitted tasks before exiting, preventing leaked background execution.

---

## 3. Carrier Thread Pinning and Best Practices

A virtual thread is pinned to its carrier thread when it cannot be unmounted during a blocking operation.

### Guidelines for Pinning Avoidance

1. **Avoid Synchronized Blocks around I/O**: Replace `synchronized (lock)` blocks enclosing blocking network or disk I/O with `java.util.concurrent.locks.ReentrantLock`.
2. **Never Pool Virtual Threads**: Virtual threads are ephemeral and cheap to instantiate. Placing them inside bounded pools (`ThreadPoolExecutor`) is an anti-pattern.
3. **Inspect Diagnostics**: Monitor carrier pinning events in production by passing the JVM flag:
   `-Djdk.tracePinnedThreads=full`
