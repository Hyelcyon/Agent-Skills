# Event-Driven Architecture and the Transactional Outbox Pattern

Engineering standards for decoupled asynchronous communication, guaranteed message dispatch, and idempotent consumer processing.

---

## 1. The Dual-Write Vulnerability

Writing to an application database and publishing a message to a broker (Kafka, RabbitMQ, SQS) in two separate operations creates an unavoidable race condition:
- If the database commit succeeds but the message broker network call times out, downstream systems never receive the event.
- If the message publishes first but the database transaction rolls back, downstream systems process phantom data.

---

## 2. The Transactional Outbox Pattern

Guarantee atomic consistency by storing outgoing messages inside an `outbox` table in the exact same local database transaction as the business entity mutation:

```sql
BEGIN TRANSACTION;

UPDATE accounts
SET balance = balance - 100
WHERE id = 'acc_1';

INSERT INTO outbox_events (id, aggregate_type, aggregate_id, event_type, payload, status)
VALUES (
  'evt_101',
  'account',
  'acc_1',
  'FUNDS_DEBITED',
  '{"amount": 100, "currency": "USD"}'::jsonb,
  'PENDING'
);

COMMIT;
```

An independent relay worker reads `PENDING` outbox records via Change Data Capture (CDC / Debezium) or batched polling (`SKIP LOCKED`) and publishes them to the broker.

---

## 3. Idempotent Consumer Guarantee

Because distributed message brokers provide "at least once" delivery, consumers must guarantee idempotency:
- Every event must carry a unique deterministic identifier (`id` or `eventId`).
- Consumers must store processed event IDs in an `idempotency_keys` table inside the consumer database transaction.
- If an event ID already exists in the table, the consumer acknowledges the message immediately and skips duplicate business execution.

---

## 4. Poison Pill Handling via Dead Letter Queues (DLQ)

When a consumer encounters unrecoverable deserialization or validation errors:
- Route the failed message to a Dead Letter Queue (DLQ) after a capped retry threshold (e.g., 3 attempts).
- Never block the consumer partition with an infinite retry loop.
- Attach error metadata (`exception_class`, `failure_timestamp`, `retry_count`) to DLQ message headers.
