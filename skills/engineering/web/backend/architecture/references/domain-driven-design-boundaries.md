# Domain-Driven Design (DDD) Boundaries and Strategic Modeling

Engineering standards for defining bounded contexts, aggregate consistency boundaries, and anti-corruption layers.

---

## 1. Bounded Context Isolation

A Bounded Context defines a strict linguistic and conceptual boundary within which a domain model applies:
- Terms have singular, unambiguous meanings within a context (e.g., `Account` in Billing means an invoicing balance; in Authentication it means credentials and roles).
- Contexts must not share internal database tables directly. Communication across bounded contexts occurs via public APIs, events, or shared kernel contracts.

---

## 2. Aggregate Roots and Transaction Invariants

An Aggregate Root is the single entity through which all external modifications to a domain cluster must pass:
- **Consistency Boundary**: Invariants within an aggregate must be strictly enforced within a single database transaction.
- **Reference by ID Only**: Aggregates outside the boundary must reference the root strictly by primary ID, never holding direct object references to internal child entities.
- **Transactional Rule**: Modify only one aggregate root per database transaction. Coordinate changes across multiple aggregates asynchronously using domain events.

---

## 3. Anti-Corruption Layer (ACL)

When integrating with legacy systems or third-party vendor APIs:
- Never allow foreign data structures or naming models to pollute your core domain model.
- Introduce an Anti-Corruption Layer (ACL) containing translation adapters that transform foreign payloads into clean, domain-specific value objects and entities.

```typescript
export interface ThirdPartyUserPayload {
  usr_first_nm: string;
  usr_last_nm: string;
  actv_flg: 'Y' | 'N';
}

export interface DomainUser {
  fullName: string;
  isActive: boolean;
}

export class UserAntiCorruptionAdapter {
  static toDomain(payload: ThirdPartyUserPayload): DomainUser {
    return {
      fullName: `${payload.usr_first_nm} ${payload.usr_last_nm}`.trim(),
      isActive: payload.actv_flg === 'Y'
    };
  }
}
```

---

## 4. Key DDD Architectural Rules
- Keep domain entities completely decoupled from database ORM decorators and HTTP transport logic.
- Model immutable attributes as Value Objects with self-validating constructors.
- Treat Domain Events as past-tense immutable facts (`OrderPlaced`, `PaymentReceived`).
