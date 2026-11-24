# Enterprise Backend Architecture Runbook

Guidelines for structuring resilient backend services: Modular Monolith vs Microservices, Hexagonal Architecture (Ports and Adapters), and the Transactional Outbox Pattern.

---

## 1. Modular Monolith vs Microservices

### The Premature Distribution Trap
Breaking an early-stage or medium-scale system into dozens of independent microservices prematurely introduces massive operational overhead:
- Network latency, serialization overhead, and partial failures.
- Distributed transaction complexity (two-phase commit vs sagas).
- End-to-end tracing and deployment synchronization friction.

### The Modular Monolith Alternative
Structure a single deployable artifact into strictly isolated modules:
- Each module owns its own private domain logic, entities, and database schemas.
- Cross-module communication occurs strictly through public TypeScript/Python interfaces or internal in-memory event buses.
- Modules can be cleanly extracted into standalone microservices when team size or scaling requirements demand it.

---

## 2. Hexagonal Architecture (Ports and Adapters)

### Core Invariant
Domain logic must have ZERO dependencies on external frameworks, databases, or transport protocols (HTTP, gRPC, CLI).

- **Domain Core**: Pure business entities, value objects, and domain services.
- **Inbound Ports**: Interfaces defining what the application can do (e.g. `CreateOrderUseCase`).
- **Outbound Ports**: Interfaces defining external dependencies required by the domain (e.g. `OrderRepositoryPort`, `PaymentGatewayPort`).
- **Adapters**: Concrete implementations (e.g. `PostgresOrderRepository`, `StripePaymentAdapter`, `ExpressOrderController`).

---

## 3. Transactional Outbox Pattern

### Dual-Write Problem
When a service updates a database and publishes an event to a message broker (e.g. Kafka, RabbitMQ), a process crash between the two operations leaves the system in an inconsistent state.

### Outbox Solution
1. In a single atomic database transaction, write the business entity mutation AND insert an event into an `outbox` table.
2. A separate background worker or CDC (Change Data Capture / Debezium) process reads from the `outbox` table and publishes events to the broker.
3. Upon confirmed broker acknowledgment, the outbox record is marked published or deleted.
