# Enterprise Backend Architecture & Folder Structure Standard

A production-grade architectural specification for structuring backend services (Node.js, TypeScript, Go, Python), synthesized from distributed systems standards at Amazon, Google, Netflix, and Uber, combining Hexagonal Architecture (Ports and Adapters) with Vertical Modular boundaries.

---

## 1. Architectural Philosophy: The Modular Hexagonal Consensus

Traditional backend codebases organize files by technical layers (Package-by-Layer / MVC):
- `src/controllers/` (all HTTP endpoints in one directory)
- `src/services/`
- `src/models/`
- `src/repositories/`

### The Technical Layering Failure Mode
As backend services grow past 20 endpoints:
1. **The Distributed God Service**: A single `UserService` is injected into 30 unrelated controllers, accumulating 3,000 lines of disparate queries and breaking single responsibility.
2. **Circular Dependencies**: Services import each other mutually, requiring complex runtime bootstrapping workarounds.
3. **Framework Lock-in**: Business rules become intertwined with database ORM decorators and HTTP request/response objects, making testing without database mocks impossible.

### The Big Tech Consensus: Modular Hexagonal Architecture
Group code by **Business Domain Modules (Vertical Boundary)**, and structure the inside of each module using **Ports and Adapters (Horizontal Inward Invariant)**:
- **Vertical Boundaries**: High cohesion within a domain (e.g. `billing`, `inventory`, `identity`). Modules communicate via public interfaces or in-memory events.
- **Horizontal Decoupling**: Business logic in the core domain knows nothing about HTTP frameworks, ORMs, SQL dialects, or external vendor APIs.

---

## 2. Standard Enterprise Backend Directory Anatomy

```text
backend/ (or server/)
├── src/
│   ├── config/                 # Immutable runtime environment & infrastructure configuration
│   │   ├── database.ts         # Connection pool initialization
│   │   ├── env.ts              # Zod-validated environment variables
│   │   └── telemetry.ts        # OpenTelemetry tracing & Prometheus metrics
│   │
│   ├── modules/                # Self-contained domain modules (bounded contexts)
│   │   ├── identity/           # Authentication, users, access roles
│   │   ├── billing/            # Invoicing, subscriptions, payments
│   │   └── inventory/          # Catalog, stock, fulfillment
│   │
│   ├── shared/                 # Kernel & shared cross-cutting infrastructure
│   │   ├── errors/             # RFC 9457 Problem Details standard error taxonomy
│   │   ├── middleware/         # Auth verification, rate limiting, request context
│   │   ├── pagination/         # Cursor-based pagination codecs
│   │   └── types/              # Result<T, E>, ResultAsync, ValueObject base types
│   │
│   ├── app.ts                  # Express/Fastify application factory & router registration
│   └── server.ts               # Process bootstrap, signal handlers (SIGTERM), port listener
│
├── tests/                      # Multi-module integration, E2E, and smoke test suites
└── prisma/ (or migrations/)    # Schema definitions and database migration scripts
```

---

## 3. Anatomy of a Domain Module (`src/modules/<module>/`)

Each domain module implements a mini-hexagonal structure:

```text
src/modules/billing/
├── domain/                     # Tier 1: Pure business core (Zero external dependencies)
│   ├── entities/               # Rich domain models with encapsulated invariants
│   │   ├── invoice.entity.ts
│   │   └── subscription.entity.ts
│   ├── ports/                  # Outbound dependency contracts (Interfaces)
│   │   ├── invoice.repository.port.ts
│   │   └── payment-gateway.port.ts
│   └── events/                 # Immutable domain events
│       └── invoice-paid.event.ts
│
├── application/                # Tier 2: Use cases & application orchestration
│   ├── use-cases/              # Command and Query execution pipelines
│   │   ├── process-payment.use-case.ts
│   │   └── get-billing-summary.use-case.ts
│   └── dto/                    # Input/Output validation contracts
│       ├── process-payment.dto.ts
│       └── billing-summary.dto.ts
│
├── infrastructure/             # Tier 3: Secondary adapters (Driven by the domain)
│   ├── repositories/           # Concrete database persistence
│   │   └── postgres-invoice.repository.ts
│   └── external-clients/       # Third-party vendor adapters
│       └── stripe-payment.adapter.ts
│
├── presentation/               # Tier 4: Primary adapters (Driving the domain)
│   ├── controllers/            # HTTP request/response handlers
│   │   └── billing.controller.ts
│   └── routes/                 # Endpoint routing & middleware attachment
│       └── billing.routes.ts
│
└── index.ts                    # Module Public API (Exports only for other modules)
```

---

## 4. The Inward Dependency Rule

Dependencies must point strictly **inward** toward the pure Domain Core:

```
[ presentation/ ] ──────► [ application/ ] ──────► [ domain/ ]
                                                       ▲
                                                       │
[ infrastructure/ ] ───────────────────────────────────┘
   (Implements ports defined in domain/)
```

### Invariant 1: Domain Purity
- Code in `domain/` must NEVER import from `presentation/`, `infrastructure/`, `application/`, or external frameworks (Express, Fastify, Prisma, TypeORM, Axios).
- Domain entities must be pure TypeScript/Python classes or functions.

### Invariant 2: Inversion of Control via Ports
- Application use cases must never directly import concrete repository implementations:
  - ❌ **FORBIDDEN**: `import { PostgresInvoiceRepository } from '../infrastructure/repositories/postgres-invoice.repository';`
  - ✅ **ALLOWED**: `import { InvoiceRepositoryPort } from '../../domain/ports/invoice.repository.port';`
- Infrastructure adapters implement the domain ports. Dependency injection wires the implementation at runtime in `app.ts` or a composition root.

### Invariant 3: Inter-Module Communication via Public API
- `modules/order` must never import internal infrastructure or controllers from `modules/billing`.
- Communication between modules occurs strictly through:
  1. The module's root `index.ts` exporting application use-case interfaces.
  2. Asynchronous Domain Events via the Transactional Outbox pattern.

---

## 5. Agent File Generation & Naming Standards

When an autonomous AI agent is prompted to create an endpoint, entity, or background worker, it must execute in this deterministic sequence:

### Decision Tree for Placement
1. **Is it an external communication driver (HTTP, CLI, Webhook receiver)?**
   - YES ➔ Place in `src/modules/<module>/presentation/`.
2. **Is it a step-by-step orchestrator of a user intent (command/query)?**
   - YES ➔ Place in `src/modules/<module>/application/use-cases/`.
3. **Is it an input validation schema or response formatting contract?**
   - YES ➔ Place in `src/modules/<module>/application/dto/`.
4. **Is it an interface defining database or external service access?**
   - YES ➔ Place in `src/modules/<module>/domain/ports/`.
5. **Is it a concrete database query, ORM mapping, or third-party client?**
   - YES ➔ Place in `src/modules/<module>/infrastructure/`.
6. **Is it an immutable business entity enforcing validation invariants?**
   - YES ➔ Place in `src/modules/<module>/domain/entities/`.

### File Creation Pipeline (Order of Implementation)
```
Step 1: Define DTO & Input Schema: `application/dto/<action>.dto.ts`
Step 2: Define Domain Entity & Invariants: `domain/entities/<entity>.entity.ts`
Step 3: Define Port Interface: `domain/ports/<entity>.repository.port.ts`
Step 4: Implement Infrastructure Adapter: `infrastructure/repositories/postgres-<entity>.repository.ts`
Step 5: Implement Use Case: `application/use-cases/<action>.use-case.ts`
Step 6: Implement Controller & Route: `presentation/controllers/<entity>.controller.ts`
Step 7: Register Route in App: `presentation/routes/<entity>.routes.ts` ➔ `app.ts`
```

### Naming Conventions
- **Files**: strictly `kebab-case.<role>.ts` (e.g., `user.entity.ts`, `create-user.dto.ts`, `postgres-user.repository.ts`, `user.controller.ts`).
- **Classes**: strictly `PascalCase` with explicit role suffix (e.g., `UserEntity`, `CreateUserDto`, `PostgresUserRepository`, `UserController`).
- **Ports / Interfaces**: strictly `<Role>Port` (e.g., `UserRepositoryPort`, `PaymentGatewayPort`).
- **Use Cases**: named with imperative verbs (e.g., `CreateUserUseCase`, `CancelSubscriptionUseCase`).
