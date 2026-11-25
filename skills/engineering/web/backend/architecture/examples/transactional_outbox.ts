import { randomUUID } from 'node:crypto';

interface DatabaseTransaction {
  execute(sql: string, params: readonly unknown[]): Promise<{ rowCount: number }>;
}

interface UnitOfWork {
  runInTransaction<T>(fn: (tx: DatabaseTransaction) => Promise<T>): Promise<T>;
}

interface OutboxEvent {
  id: string;
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payload: string;
  createdAt: Date;
}

interface UserRegisteredPayload {
  userId: string;
  email: string;
  registeredAt: string;
}

class UserRegistrationUseCase {
  async registerUser(
    uow: UnitOfWork,
    userId: string,
    email: string,
    passwordHash: string
  ): Promise<string> {
    return uow.runInTransaction(async (tx) => {
      const userInsertSql =
        'INSERT INTO users (id, email, password_hash, created_at) VALUES ($1, $2, $3, NOW())';
      await tx.execute(userInsertSql, [userId, email, passwordHash]);

      const eventId = randomUUID();
      const eventPayload: UserRegisteredPayload = {
        userId,
        email,
        registeredAt: new Date().toISOString()
      };

      const outboxSql =
        'INSERT INTO outbox_events (id, aggregate_type, aggregate_id, event_type, payload, status, attempts, next_retry_at, created_at) VALUES ($1, $2, $3, $4, $5, $6, 0, NOW(), NOW())';
      await tx.execute(outboxSql, [
        eventId,
        'User',
        userId,
        'USER_REGISTERED',
        JSON.stringify(eventPayload),
        'PENDING'
      ]);

      return eventId;
    });
  }
}

class IdempotentEventConsumer {
  async processOnce(
    uow: UnitOfWork,
    event: OutboxEvent,
    handler: (tx: DatabaseTransaction, event: OutboxEvent) => Promise<void>
  ): Promise<{ processed: boolean }> {
    return uow.runInTransaction(async (tx) => {
      // Atomic insert-first deduplication avoids check-then-insert races under duplicate deliveries
      const claim = await tx.execute(
        'INSERT INTO processed_events (event_id, processed_at) VALUES ($1, NOW()) ON CONFLICT (event_id) DO NOTHING',
        [event.id]
      );

      if (claim.rowCount === 0) {
        return { processed: false };
      }

      await handler(tx, event);
      return { processed: true };
    });
  }
}

export { UserRegistrationUseCase, IdempotentEventConsumer };
export type { DatabaseTransaction, UnitOfWork, OutboxEvent, UserRegisteredPayload };
