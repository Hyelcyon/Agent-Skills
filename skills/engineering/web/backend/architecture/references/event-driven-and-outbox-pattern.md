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
WHERE id = 'acc_1' AND balance >= 100;

INSERT INTO outbox_events (id, aggregate_type, aggregate_id, event_type, payload, status, attempts, next_retry_at)
VALUES (
  gen_random_uuid(),
  'account',
  'acc_1',
  'FUNDS_DEBITED',
  '{"amountCents": 100, "currency": "USD"}'::jsonb,
  'PENDING',
  0,
  NOW()
);

COMMIT;
```

An independent relay worker claims ready `PENDING` outbox records (`next_retry_at <= NOW()`) via Change Data Capture (CDC / Debezium) or batched polling (`FOR UPDATE SKIP LOCKED` with lease timestamps) and publishes them to the broker.

---

## 3. Idempotent Consumer Guarantee

Because distributed message brokers provide "at least once" delivery, consumers must guarantee idempotency atomically inside the consumer transaction (never check-then-insert with `SELECT` + `INSERT`, which races under duplicate deliveries):
- Every event must carry a unique deterministic identifier (`id` or `eventId`).
- Atomically claim the event ID first using a unique primary key constraint:
  ```sql
  INSERT INTO processed_events (event_id, processed_at)
  VALUES ($1, NOW())
  ON CONFLICT (event_id) DO NOTHING
  RETURNING event_id;
  ```
- If 0 rows are returned, roll back/commit the no-op, acknowledge the message immediately, and skip duplicate business execution.

---

## 4. Poison Pill Handling via Dead Letter Queues (DLQ)

When a consumer or outbox relay encounters errors:
- Route permanent deserialization, schema, or validation errors directly to the Dead Letter Queue (DLQ) without burning retries.
- Retry transient failures with bounded exponential backoff + full jitter up to a capped threshold (e.g., 3-5 attempts), then route to the DLQ so a poison pill never blocks a partition.
- Attach error metadata (`exception_class`, `failure_timestamp`, `retry_count`) to DLQ message headers.
