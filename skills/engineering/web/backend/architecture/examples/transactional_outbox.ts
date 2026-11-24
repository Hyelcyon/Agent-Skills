interface DatabaseTransaction {
  execute(sql: string, params: readonly unknown[]): Promise<void>;
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
    tx: DatabaseTransaction,
    userId: string,
    email: string,
    passwordHash: string
  ): Promise<void> {
    const userInsertSql = 'INSERT INTO users (id, email, password_hash, created_at) VALUES ($1, $2, $3, NOW())';
    await tx.execute(userInsertSql, [userId, email, passwordHash]);

    const eventPayload: UserRegisteredPayload = {
      userId,
      email,
      registeredAt: new Date().toISOString()
    };

    const outboxSql = 'INSERT INTO outbox_events (id, aggregate_type, aggregate_id, event_type, payload, status, created_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())';
    await tx.execute(outboxSql, [
      'User',
      userId,
      'USER_REGISTERED',
      JSON.stringify(eventPayload),
      'PENDING'
    ]);
  }
}

export { UserRegistrationUseCase };
export type { DatabaseTransaction, OutboxEvent, UserRegisteredPayload };
