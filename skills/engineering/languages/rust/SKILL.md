---
name: rust
description: Use when building or auditing high-performance Rust applications, optimizing ownership and borrowing, enforcing fearless concurrency, designing type-state patterns, or eliminating memory leaks and unsafe code.
---

# Modern Rust Senior Engineering (Rust 2021 / 2024 Edition)

Senior engineering runbook for zero-cost abstractions, fearless concurrency, idiomatic error handling, and robust memory safety in Rust.

## When to Use
- Writing low-latency, memory-safe system components and CLI tools.
- Eliminating race conditions using Rust's `Send` and `Sync` concurrency invariants.
- Designing domain state machines via Zero-Sized Types and the Type-State pattern.
- Structuring library errors with `thiserror` and application errors with `anyhow`.
- Auditing memory layouts and enforcing sound `unsafe` boundaries.

## When NOT to Use
- High-level web UI rapid prototyping (use `react`, `vue`, or `nextjs`).
- Scripts and simple ad-hoc automation where Python is faster to iterate on.

---

## 5-Phase Agent Operational Protocol

```
Phase 1: Cargo Workspace & Toolchain Profiling (Cargo.toml, MSRV 1.80+)
Phase 2: Domain Modeling with Type-State & Zero-Sized Types
Phase 3: Ownership & Zero-Copy Execution (Borrowing, &[u8], Cow<'a, T>)
Phase 4: Error Handling & Invariant Enforcement (thiserror, ?, RAII)
Phase 5: Quality Gate & Static Proof (cargo test, clippy, miri)
```

### Phase 1: Workspace & Toolchain Profiling
Verify target edition (2021/2024) and MSRV. Configure strict lints (`clippy::all`, `clippy::pedantic`) in `Cargo.toml`.

### Phase 2: Domain Modeling with Type-State
Encode state transitions into the type system using Zero-Sized Types and `PhantomData` to catch invalid operations at compile time:
```rust
pub struct Disconnected;
pub struct Connected;
pub struct Channel<State> {
    id: u64,
    _state: std::marker::PhantomData<State>,
}
```

### Phase 3: Ownership & Zero-Copy Execution
Prioritize borrowing (`&str`, `&[u8]`) over cloning. Use `std::borrow::Cow` for conditional allocation. Never insert premature `.clone()` calls to silence the borrow checker.

### Phase 4: Error Handling & Invariants
Propagate errors deterministically with the `?` operator. Use `thiserror` for structured domain errors. If an invariant cannot fail, document the reason using `.expect("invariant: explanation")` instead of bare `.unwrap()`.

### Phase 5: Verification & Quality Gate
Run test suite and static analysis:
```bash
cargo test
cargo clippy --all-targets -- -D warnings
```

---

## Fatal Mistakes Never to Make & Prohibited Anti-Patterns

- ❌ Unchecked `unwrap()` in library code (use `?` or `.expect("invariant: reason")`).
- ❌ Holding a `std::sync::MutexGuard` or `RwLockGuard` across an `.await` point in async code (causes executor deadlocks; use block scoping or `tokio::sync::Mutex`).
- ❌ Indiscriminate `.clone()` calls without profiling or clear ownership justification.
- ❌ Unsound `unsafe` blocks without `// SAFETY:` invariant documentation and Miri verification.
- ❌ Blocking async worker threads with CPU-heavy or blocking I/O operations (use `tokio::task::spawn_blocking`).
- ❌ Silencing compiler/clippy diagnostics globally with `#![allow(warnings)]`.

---

## References & Documentation
- Anti-Spaghetti Rust Runbook: [references/anti-spaghetti-patterns.md](./references/anti-spaghetti-patterns.md)
- Async Runtimes & Tokio: [references/async-runtimes-and-tokio.md](./references/async-runtimes-and-tokio.md)
- Memory Management & Sound Unsafe: [references/memory-management-and-unsafe.md](./references/memory-management-and-unsafe.md)

## Resources & Examples
- Cargo Manifest: [resources/Cargo.toml](./resources/Cargo.toml)
- Rustfmt Formatting Config: [resources/rustfmt.toml](./resources/rustfmt.toml)
- Clippy Lint Config: [resources/clippy.toml](./resources/clippy.toml)
- Type State Pattern Example: [examples/type_state_pattern.rs](./examples/type_state_pattern.rs)
- Custom Error Handling Example: [examples/error_handling_anyhow.rs](./examples/error_handling_anyhow.rs)
- Zero-Copy Parser Example: [examples/zero_copy_parser.rs](./examples/zero_copy_parser.rs)
