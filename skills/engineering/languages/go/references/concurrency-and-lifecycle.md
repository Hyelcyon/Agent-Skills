# Go Concurrency and Goroutine Lifetime Architecture

Senior concurrency architecture derived from the **Uber Go Style Guide**, **Dave Cheney's Practical Go**, and official **Go Proverbs**.

---

## 1. The Goroutine Lifetime Invariant

> *"Never start a goroutine without knowing when it will stop."* — Dave Cheney

Launching unmanaged goroutines (`go doWork()`) causes silent goroutine leaks, socket exhaustion, and data races during application shutdown. 

### The Managed Lifecycle Protocol (Uber Standard)
If a struct or component starts background goroutines, it **must** expose a lifecycle object that:
1. Signals the goroutine to terminate.
2. **Waits for the goroutine to exit** before returning.

```go
package worker

type Service struct {
	stopCh chan struct{}
	doneCh chan struct{}
}

func NewService() *Service {
	s := &Service{
		stopCh: make(chan struct{}),
		doneCh: make(chan struct{}),
	}
	go s.run()
	return s
}

func (s *Service) run() {
	defer close(s.doneCh)
	for {
		select {
		case <-s.stopCh:
			return
		default:
			// Execute periodic unit of work
		}
	}
}

// Stop signals the worker and blocks until execution has deterministically terminated.
func (s *Service) Stop() {
	close(s.stopCh)
	<-s.doneCh
}
```

### Prohibition of Goroutines in `init()`
Spawning goroutines inside `init()` is strictly prohibited. It creates untestable, unmanageable background tasks that run outside any controlled lifecycle.

---

## 2. Channel Buffering Rules: 0 or 1

According to the Uber Go Style Guide, channel buffer sizes should almost always be **0 (unbuffered)** or **1 (single-slot handoff)**:

```go
// ✅ Unbuffered: Synchronous rendezvous ensuring receiver has accepted payload
ch := make(chan Result)

// ✅ Buffer of 1: Asynchronous non-blocking signal or cancellation handoff
cancelCh := make(chan struct{}, 1)
```

### Why Arbitrary Buffer Sizes (>1) Are Prohibited:
- Large buffer sizes (`make(chan T, 100)`) introduce hidden queueing and obscure deadlocks.
- When the buffer fills up under load, the sender still blocks, converting an asynchronous call into an unexpected synchronous block.
- If queueing is required, use an explicit, bounded worker queue with backpressure metrics, not arbitrary channel buffers.

---

## 3. Structured Concurrency with `errgroup.Group`

When coordinating multiple parallel tasks to fulfill a single request, bind tasks using `golang.org/x/sync/errgroup`:

```go
package aggregator

import (
	"context"
	"fmt"
	"golang.org/x/sync/errgroup"
)

type Result struct {
	Data string
}

func QueryAll(ctx context.Context, sources []string) ([]Result, error) {
	g, groupCtx := errgroup.WithContext(ctx)
	results := make([]Result, len(sources))

	for i, src := range sources {
		idx, target := i, src
		g.Go(func() error {
			res, err := fetchSource(groupCtx, target)
			if err != nil {
				return fmt.Errorf("querying %s: %w", target, err)
			}
			results[idx] = res
			return nil
		})
	}

	if err := g.Wait(); err != nil {
		return nil, err
	}
	return results, nil
}

func fetchSource(ctx context.Context, src string) (Result, error) {
	return Result{Data: src}, nil
}
```

### Invariants:
- Assigning to pre-allocated slice indices (`results[idx] = res`) is safe across disjoint goroutines without lock contention.
- Never append (`results = append(results, res)`) to a shared slice across concurrent goroutines without a mutex.

---

## 4. Mutex Copy-Lock Safety and Pointer Receivers

Structs containing `sync.Mutex` or `sync.RWMutex` must never be copied. Copying a mutex duplicates the internal lock state, causing deadlocks:

```go
// ❌ WRONG: Value receiver copies the mutex
type Counter struct {
    mu    sync.Mutex
    count int
}

func (c Counter) Increment() { // go vet flags copylocks
    c.mu.Lock()
    defer c.mu.Unlock()
    c.count++
}

// ✅ IDIOMATIC: Always use pointer receivers for types containing sync fields
func (c *Counter) Increment() {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.count++
}
```

---

## 5. Loop Variable Scoping (Go 1.22+)

Starting with **Go 1.22**, each iteration of a `for` loop creates a distinct variable instance:
```go
for _, item := range items {
    // In Go 1.22+, each goroutine closes over its own per-iteration 'item' variable
    go func() {
        process(item)
    }()
}
```
However, passing arguments explicitly (`go func(val Item) { ... }(item)`) remains recommended when authoring shared libraries intended to compile on older Go toolchains.
