---
name: luau
description: Use when writing or reviewing Luau or Roblox game scripts, enforcing strict type-checking, optimizing metatables, avoiding memory leaks from engine instances and connections, or using native code generation.
---

# Senior Luau & Roblox Architecture

Enterprise guidelines and performance patterns for large-scale systems in Luau, focusing on static type strictness, metatable efficiency, and garbage collection management.

## When to Use
- Writing game or core systems under `--!strict` type checking.
- Architecting OOP prototypes without closure-allocation penalties.
- Managing Roblox Instance lifecycles and avoiding engine memory leaks.
- Leveraging native code generation (`--!native`) and memory `buffer` allocations.

## When NOT to Use
- General web backend or browser frontend programming.
- Low-level native desktop systems where C++/Rust is required.

---

## 5-Phase Agent Operational Protocol

```
Phase 1: Script Environment & Mode Profiling (--!strict, --!native)
Phase 2: Data Model & Type Contract Definition (export type)
Phase 3: Prototype & Metatable Allocation (Zero closure penalty)
Phase 4: Signal Lifecycle & Memory Management (Janitor, :Destroy())
Phase 5: Linter & Analysis Verification (selene, luau-lsp)
```

### Phase 1: Script Mode Profiling
Declare `--!strict` at the top of all modules. Add `--!native` for computationally intensive algorithms, vector mathematics, or physics loops.

### Phase 2: Data Model & Type Contracts
Define exported types for all domain models, state structs, and function signatures. Avoid untyped `any` tables.

### Phase 3: Prototype & Metatable Allocation
Define member methods exclusively on the prototype table (`__index`), never inside `new()` constructors, preventing closure allocation bloat:
```lua
local Service = {}
Service.__index = Service
function Service.new()
    return setmetatable({}, Service)
end
```

### Phase 4: Signal Lifecycle & Cleanup
Track all event connections (`RBXScriptConnection`) and instance allocations with a cleanup coordinator (Janitor/Maid). Always call `:Destroy()` on unused instances and disconnect connections to prevent engine memory leaks.

### Phase 5: Verification & Static Analysis
Run automated linter and type-checking suites:
```bash
selene src/
luau-analyze src/
```

---

## Prohibited Anti-Patterns

- ❌ Defining member functions inside `new()` constructors.
- ❌ Setting an Instance variable to `nil` without calling `:Destroy()`.
- ❌ Modifying `__mode` of an existing metatable after creation.
- ❌ Leaving `RunService.Heartbeat` connections active after entity disposal.
- ❌ Omitting `--!strict` in production libraries and modules.

---

## References & Documentation
- Enterprise Luau Tooling: [references/enterprise-tooling.md](./references/enterprise-tooling.md)
- Type Checking & Metatables: [references/type-checking-modes-and-metatables.md](./references/type-checking-modes-and-metatables.md)
- Actor Concurrency & Networking: [references/actor-multithreading-and-networking.md](./references/actor-multithreading-and-networking.md)

## Resources & Examples
- Rojo Project Definition: [resources/default.project.json](./resources/default.project.json)
- Selene Linter Config: [resources/selene.toml](./resources/selene.toml)
- StyLua Formatter Config: [resources/stylua.toml](./resources/stylua.toml)
- Strict Service Architecture Example: [examples/strict_service_example.luau](./examples/strict_service_example.luau)
- Lightweight Typed Signal Bus Example: [examples/signal_event_bus.luau](./examples/signal_event_bus.luau)
- Remote Rate Limiter Example: [examples/network_rate_limiter.luau](./examples/network_rate_limiter.luau)
