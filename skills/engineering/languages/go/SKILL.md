---
name: go
description: Use when building, refactoring, or optimizing modern Go applications (Go 1.22 - 1.24+), designing robust concurrent services with errgroup and context, implementing structured logging with log/slog, wrapping domain errors, or tuning garbage collector and memory allocations.
---

# Modern Go Senior Engineering (Go 1.22 - 1.24+)

Senior engineering guidelines grounded in the **Uber Go Style Guide**, **Google Go Style Guide (GoTips & CodeReviewComments)**, **Dave Cheney's Practical Go**, and official **Go Proverbs**.

## When to Use
- Authoring production Go microservices, distributed pipelines, and CLI daemons (Go 1.22 - 1.24+).
- Implementing structured concurrency with deterministic goroutine lifecycles and `errgroup.Group`.
- Designing clean, unpolluted consumer-driven interfaces and functional options configurations.
- Structuring context-rich error hierarchies using `fmt.Errorf("%w")`, `errors.Is`, and `errors.As`.
- Eliminating goroutine leaks, data races, interface boxing, and premature heap allocations.

## When NOT to Use
- High-level browser UI development (use `react`, `vue`, or `nextjs`).
- Rapid ad-hoc scripting where Python or shell scripts yield faster iteration.
- Low-level kernel or bare-metal embedded programming where Rust or C/C++ is mandatory.

---

## 5-Phase Agent Operational Protocol

```
Phase 1: Environment & Toolchain Inspection (go.mod, Go 1.22+, golangci-lint)
Phase 2: Domain Boundary & Interface Discovery (Avoid interface pollution, Line of Sight)
Phase 3: Concurrency & Lifetime Control (Never fire-and-forget, context cancellation)
Phase 4: Error Handling & Observability Discipline (Handle once, %w wrapping, log/slog)
Phase 5: Verification & Race Auditing (go test -race, golangci-lint run, go vet)
```

### Phase 1: Environment & Toolchain Inspection
Target Go 1.22+ runtime. Configure `golangci-lint` with strict linters (`errcheck`, `govet`, `revive`, `staticcheck`, `gocritic`, `gosec`, `bodyclose`, `noctx`).

### Phase 2: Domain Boundary & Interface Discovery
- **Don't design with interfaces, discover them (Uber & Cheney)**: Do not create interfaces upfront for every struct just "in case" or purely for mocking. Accept interfaces, return concrete structs.
- **Line of Sight (Google GoTip #1)**: Keep the happy path unindented down the left margin. Guard against errors early with `if err != nil { return ... }` and eliminate unnecessary `else` blocks.
- **Package Naming (Google)**: Concise, lowercase, single-word names (`user`, `oauth2`). Never stutter (`user.New()`, not `user.NewUser()`).

### Phase 3: Concurrency & Lifetime Control
- **Goroutine Lifetime Invariant (Dave Cheney & Uber)**: Never start a goroutine without knowing how and when it will stop. Any struct spawning background goroutines must provide an explicit `Stop()` or `Close()` method that signals cancellation and **waits for exit**.
- **Never spawn goroutines in `init()`**.
- **Context Propagation**: Always pass `ctx context.Context` as the first parameter. Never store `context.Context` inside a struct field.

### Phase 4: Error Handling & Observability Discipline
- **Handle Errors Once (Uber & Cheney)**: Never log an error and return it simultaneously. Propagate context with `%w` and log only once at the service/transport boundary.
- **Contextual Formatting Without Stutter**: Do not prefix errors with "failed to". Write `fmt.Errorf("reading file %s: %w", path, err)`.
- **Error Strings (Google)**: All lowercase, no trailing punctuation (`errors.New("connection reset")`).

### Phase 5: Verification & Race Auditing
Execute race detection, vet checks, and linter validation:
```bash
go vet ./...
go test -race -v ./...
golangci-lint run ./...
```

---

## Prohibited Anti-Patterns & Fatal Mistakes

- ❌ **Fire-and-forget goroutines**: Spawning `go worker()` without a deterministic shutdown wait mechanism.
- ❌ **Idempotency-blind `close(ch)` or double-close panics**: Guard channel closes with `sync.Once` and never close channels from the receiver side.
- ❌ **Busy-spin `select { default: }` loops**: Always block on a channel, `time.NewTicker`, or `ctx.Done()`.
- ❌ **Interface pollution**: Creating single-implementation interfaces ahead of concrete usage.
- ❌ **Storing `context.Context` inside structs**: Breaches request lifecycle scoping.
- ❌ **Double error handling**: Logging an error and then returning it up the call chain.
- ❌ **Error stutter**: Formatting errors with redundant "failed to" or "error occurred" prefixes.
- ❌ **Deep `else` nesting**: Violating Line of Sight by nesting successful code paths.
- ❌ **Using `time.Sleep` for synchronization**: Relying on arbitrary sleep durations instead of channels/waitgroups.
- ❌ **Copying mutexes or skipping `go test -race`**: Passing structs containing `sync.Mutex` by value or shipping concurrent code untested under `-race`.

---

## References & Documentation
- Concurrency & Goroutine Lifetime: [references/concurrency-and-lifecycle.md](./references/concurrency-and-lifecycle.md)
- Error Discipline & Line of Sight: [references/error-handling-and-observability.md](./references/error-handling-and-observability.md)
- Memory Efficiency & Value Semantics: [references/performance-and-memory-optimization.md](./references/performance-and-memory-optimization.md)

## Resources & Examples
- Strict Golangci-Lint Config: [resources/.golangci.yml](./resources/.golangci.yml)
- Modern Go Module Template: [resources/go.mod.template](./resources/go.mod.template)
- Production Build & Test Makefile: [resources/Makefile](./resources/Makefile)
- Resilient Managed Worker Pool: [examples/resilient_worker_pool.go](./examples/resilient_worker_pool.go)
- Line-of-Sight Domain Errors: [examples/domain_errors_wrapping.go](./examples/domain_errors_wrapping.go)
- Functional Options Graceful Service: [examples/graceful_shutdown_service.go](./examples/graceful_shutdown_service.go)
