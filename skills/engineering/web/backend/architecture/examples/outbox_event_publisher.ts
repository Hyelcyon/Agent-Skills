import { randomUUID } from 'node:crypto';

export type OutboxStatus = 'PENDING' | 'PUBLISHED' | 'DEAD_LETTER';

export interface OutboxEvent {
  id: string;
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payload: string;
  status: OutboxStatus;
  attempts: number;
  nextRetryAt: number;
  lockedUntil: number;
  lastError?: string;
  createdAt: string;
}

/**
 * Persistence contract implemented by SQL (`FOR UPDATE SKIP LOCKED`) or test stores.
 */
export interface OutboxStore {
  enqueue(event: OutboxEvent): Promise<void>;
  claimBatch(batchSize: number, nowMs: number, leaseMs: number): Promise<OutboxEvent[]>;
  markPublished(eventId: string): Promise<void>;
  scheduleRetry(eventId: string, attempts: number, nextRetryAt: number, errorMessage: string): Promise<void>;
  markDeadLetter(eventId: string, attempts: number, errorMessage: string): Promise<void>;
}

export interface RelayOptions {
  batchSize?: number;
  leaseMs?: number;
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
}

export class OutboxEventPublisher {
  private readonly store: OutboxStore;
  private readonly batchSize: number;
  private readonly leaseMs: number;
  private readonly maxAttempts: number;
  private readonly baseDelayMs: number;
  private readonly maxDelayMs: number;

  constructor(store: OutboxStore, options: RelayOptions = {}) {
    this.store = store;
    this.batchSize = options.batchSize ?? 50;
    this.leaseMs = options.leaseMs ?? 30_000;
    this.maxAttempts = options.maxAttempts ?? 5;
    this.baseDelayMs = options.baseDelayMs ?? 200;
    this.maxDelayMs = options.maxDelayMs ?? 30_000;
  }

  static createEvent(
    aggregateType: string,
    aggregateId: string,
    eventType: string,
    payload: Record<string, unknown>,
    nowMs: number = Date.now()
  ): OutboxEvent {
    return {
      id: randomUUID(),
      aggregateType,
      aggregateId,
      eventType,
      payload: JSON.stringify(payload),
      status: 'PENDING',
      attempts: 0,
      nextRetryAt: nowMs,
      lockedUntil: 0,
      createdAt: new Date(nowMs).toISOString()
    };
  }

  async flushPendingBatch(
    publish: (event: OutboxEvent) => Promise<void>,
    nowMs: number = Date.now()
  ): Promise<{ published: number; retried: number; deadLettered: number }> {
    const claimed = await this.store.claimBatch(this.batchSize, nowMs, this.leaseMs);
    let published = 0;
    let retried = 0;
    let deadLettered = 0;

    for (const event of claimed) {
      try {
        await publish(event);
        await this.store.markPublished(event.id);
        published += 1;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const nextAttempts = event.attempts + 1;
        if (nextAttempts >= this.maxAttempts) {
          await this.store.markDeadLetter(event.id, nextAttempts, message);
          deadLettered += 1;
        } else {
          const cap = Math.min(this.maxDelayMs, this.baseDelayMs * 2 ** (nextAttempts - 1));
          // Full jitter spreads worker retries uniformly across [0, cap] to prevent broker thundering herds
          const jitterDelay = Math.floor(Math.random() * cap);
          await this.store.scheduleRetry(event.id, nextAttempts, nowMs + jitterDelay, message);
          retried += 1;
        }
      }
    }

    return { published, retried, deadLettered };
  }
}

export class InMemoryOutboxStore implements OutboxStore {
  private readonly records = new Map<string, OutboxEvent>();

  async enqueue(event: OutboxEvent): Promise<void> {
    this.records.set(event.id, { ...event });
  }

  async claimBatch(batchSize: number, nowMs: number, leaseMs: number): Promise<OutboxEvent[]> {
    const claimed: OutboxEvent[] = [];
    for (const record of this.records.values()) {
      if (claimed.length >= batchSize) break;
      if (record.status === 'PENDING' && record.nextRetryAt <= nowMs && record.lockedUntil <= nowMs) {
        record.lockedUntil = nowMs + leaseMs;
        claimed.push({ ...record });
      }
    }
    return claimed;
  }

  async markPublished(eventId: string): Promise<void> {
    // Delete or archive confirmed records immediately to keep the polling table compact
    this.records.delete(eventId);
  }

  async scheduleRetry(eventId: string, attempts: number, nextRetryAt: number, errorMessage: string): Promise<void> {
    const record = this.records.get(eventId);
    if (!record) return;
    record.attempts = attempts;
    record.nextRetryAt = nextRetryAt;
    record.lockedUntil = 0;
    record.lastError = errorMessage;
  }

  async markDeadLetter(eventId: string, attempts: number, errorMessage: string): Promise<void> {
    const record = this.records.get(eventId);
    if (!record) return;
    record.status = 'DEAD_LETTER';
    record.attempts = attempts;
    record.lockedUntil = 0;
    record.lastError = errorMessage;
  }

  getPendingCount(): number {
    let count = 0;
    for (const record of this.records.values()) {
      if (record.status === 'PENDING') count += 1;
    }
    return count;
  }

  getDeadLetterEvents(): OutboxEvent[] {
    return Array.from(this.records.values()).filter((r) => r.status === 'DEAD_LETTER');
  }
}
