---
name: architecture
description: Use when designing backend system architecture, structuring modular monoliths, implementing Hexagonal Architecture (Ports and Adapters), or ensuring event consistency via the Transactional Outbox pattern.
---

# Enterprise Backend Architecture & Domain Modeling

Architectural standards for crafting resilient, maintainable backend systems using Hexagonal Architecture (Ports and Adapters), Domain-Driven Design (DDD), Modular Monolith boundaries, and the Transactional Outbox pattern.

## When to Use
- Establishing module boundaries and dependency rules in backend applications.
- Decoupling core business logic from databases and external transport frameworks via Ports and Adapters.
- Preventing dual-write inconsistencies between databases and message brokers via the Transactional Outbox pattern.
- Documenting architectural trade-offs using Architecture Decision Records (ADRs).

## When NOT to Use
- Trivial single-table CRUD services where direct modular handlers suffice (apply YAGNI; never over-engineer Ports & Adapters + Outbox tables for zero complexity gain).
- Writing low-level database queries or index tunings (use `query-optimization`).
- Authoring HTTP endpoint routes or serialization schemas (use `api`).

---

## 5-Phase Agent Operational Protocol

```
Phase 1: Domain Boundary & Dependency Rule Mapping
Phase 2: Port & Contract Formulation (Inversion of Control)
Phase 3: Domain Service & Pure Business Logic Isolation
Phase 4: Adapter & Transactional Outbox Implementation
Phase 5: Boundary & Architectural Dependency Verification (ArchUnit, dependency-cruiser)
```

### Phase 1: Domain Boundary & Dependency Mapping
Define domain aggregates, bounded contexts, and dependency inversion rules. Core domain modules must never import infrastructure adapters, ORMs, or HTTP routers.

### Phase 2: Port & Contract Formulation
Model input ports (use cases) and output ports (repositories, notification gateways) as pure interfaces:
```typescript
interface OrderRepositoryPort {
  findById(id: string): Promise<Order | null>;
  save(order: Order): Promise<void>;
}
```

### Phase 3: Pure Business Logic Isolation
Implement business workflows in pure domain entities and services. Invariants must be enforced synchronously without depending on side-effecting infrastructure.

### Phase 4: Adapter & Transactional Outbox Implementation
Wire secondary adapters to concrete database and messaging implementations. Prevent dual-write state corruption by writing outbound domain events into an atomic `outbox_events` table inside the business transaction.

### Phase 5: Verification & Boundary Proof
Enforce architecture dependencies using automated linting:
```bash
npx depcruise --config .dependency-cruiser.js src/
```

---

## Prohibited Anti-Patterns & Fatal Mistakes

- ❌ Over-engineering 4-layer Hexagonal wrappers and `outbox_events` tables for simple CRUD modules with a single database (violates YAGNI).
- ❌ Direct dual-writes to database and message broker without the transactional outbox pattern.
- ❌ Polling outbox tables without row-level locking (`FOR UPDATE SKIP LOCKED`) or lease timestamps (causes duplicate dispatches across worker replicas).
- ❌ Permanently marking transient outbox delivery failures as `FAILED` on the first attempt without exponential backoff + jitter or Dead Letter Queue (DLQ) routing.
- ❌ Consuming "at-least-once" events via check-then-insert (`SELECT` then `INSERT`) instead of an atomic `ON CONFLICT DO NOTHING` deduplication guard.
- ❌ Invoking external payment/side-effect gateways without passing an idempotency key and guarding entity state with optimistic concurrency.
- ❌ Core domain entities importing external frameworks, ORMs, or HTTP drivers, or splitting monoliths before establishing bounded contexts.

---

## References & Documentation
- Modular Architecture Guide: [references/clean-and-modular-architecture.md](./references/clean-and-modular-architecture.md)
- Event-Driven & Outbox Pattern: [references/event-driven-and-outbox-pattern.md](./references/event-driven-and-outbox-pattern.md)
- Domain-Driven Design Boundaries: [references/domain-driven-design-boundaries.md](./references/domain-driven-design-boundaries.md)
- Production Folder & File Structure: [references/production-backend-architecture-and-folder-structure.md](./references/production-backend-architecture-and-folder-structure.md)

## Resources & Examples
- ADR Template: [resources/architecture-decision-record.template.md](./resources/architecture-decision-record.template.md)
- CloudEvents 1.0 Payload Envelope: [resources/event-driven-envelope.json](./resources/event-driven-envelope.json)
- Resilience & Timeout Policy: [resources/resilience-policy.json](./resources/resilience-policy.json)
- Ports and Adapters Implementation: [examples/ports_and_adapters.ts](./examples/ports_and_adapters.ts)
- Transactional Outbox Implementation: [examples/transactional_outbox.ts](./examples/transactional_outbox.ts)
- Outbox Event Publisher: [examples/outbox_event_publisher.ts](./examples/outbox_event_publisher.ts)
