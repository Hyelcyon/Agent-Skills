# Enterprise Backend Architecture Runbook

Guidelines for structuring resilient backend services: Modular Monolith vs Microservices, Hexagonal Architecture (Ports and Adapters), and the Transactional Outbox Pattern.

---

## 1. Modular Monolith vs Microservices

### The Premature Distribution Trap
Breaking an early-stage or medium-scale system into dozens of independent microservices prematurely introduces massive operational overhead:
- Network latency, serialization overhead, and partial failures.
- Distributed transaction complexity (two-phase commit vs sagas).
- End-to-end tracing and deployment synchronization friction.

### The Modular Monolith & YAGNI Boundary
Structure a single deployable artifact into strictly isolated modules:
- Each module owns its own private domain logic, entities, and database schemas.
- Cross-module communication occurs strictly through public module APIs or internal transactions/events.
- **When simpler architecture wins (YAGNI)**: Do not wrap simple single-table CRUD modules in 4-tier Hexagonal ports, adapters, and outbox tables. Start with a vertical modular slice (`route -> handler/service -> queries`), and introduce Hexagonal Ports & Adapters only where complex domain invariants must be tested independently or multiple external providers genuinely exist.
- Modules can be cleanly extracted into standalone microservices when team size or scaling requirements demand it.

---

## 2. Hexagonal Architecture (Ports and Adapters)

### Core Invariant
When Hexagonal separation is warranted, domain logic must have ZERO dependencies on external frameworks, databases, or transport protocols (HTTP, gRPC, CLI).

- **Domain Core**: Pure business entities, value objects, and domain services.
- **Inbound Ports**: Interfaces defining what the application can do (e.g. `CreateOrderUseCase`).
- **Outbound Ports**: Interfaces defining external dependencies required by the domain (e.g. `OrderRepositoryPort`, `PaymentGatewayPort`).
- **Adapters**: Concrete implementations (e.g. `PostgresOrderRepository`, `StripePaymentAdapter`, `ExpressOrderController`).

---

## 3. Transactional Outbox Pattern

### Dual-Write Problem
When a service updates a database and publishes an event to an external message broker (e.g. Kafka, RabbitMQ), a process crash between the two operations leaves the system in an inconsistent state. (For in-process modular monolith workflows sharing one database, prefer keeping cross-module updates in the same local transaction rather than adding an outbox relay prematurely.)

### Outbox Solution
1. In a single atomic database transaction, write the business entity mutation AND insert an event into an `outbox_events` table.
2. A separate background relay worker claims batches atomically (`SELECT ... FOR UPDATE SKIP LOCKED` or lease timestamps) or reads the WAL via CDC (Debezium) and publishes to the broker.
3. Transient publish failures are retried with bounded exponential backoff + full jitter and routed to a Dead Letter Queue (DLQ) after `maxAttempts`; confirmed records are marked published (with retention TTL pruning) or deleted.
