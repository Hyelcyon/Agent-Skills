import { randomUUID } from 'node:crypto';

interface IdempotencyRecord {
  status: 'PROCESSING' | 'COMPLETED';
  payloadHash: string;
  lockId: string;
  responseStatus?: number;
  responseBody?: string;
  expiresAt: number;
}

type AcquireResult =
  | { acquired: true; lockId: string }
  | { acquired: false; existing: IdempotencyRecord };

interface IdempotencyStore {
  acquire(key: string, payloadHash: string, lockTtlSeconds: number): Promise<AcquireResult>;
  completeIfOwned(
    key: string,
    lockId: string,
    responseStatus: number,
    responseBody: string | undefined,
    ttlSeconds: number
  ): Promise<void>;
  releaseIfOwned(key: string, lockId: string): Promise<void>;
}

class InMemoryIdempotencyStore implements IdempotencyStore {
  private readonly records = new Map<string, IdempotencyRecord>();

  async acquire(key: string, payloadHash: string, lockTtlSeconds: number): Promise<AcquireResult> {
    const now = Date.now();
    this.sweepExpired(now);

    const existing = this.records.get(key);
    if (existing && existing.expiresAt > now) {
      return { acquired: false, existing };
    }

    const lockId = randomUUID();
    this.records.set(key, {
      status: 'PROCESSING',
      payloadHash,
      lockId,
      expiresAt: now + lockTtlSeconds * 1000
    });
    return { acquired: true, lockId };
  }

  async completeIfOwned(
    key: string,
    lockId: string,
    responseStatus: number,
    responseBody: string | undefined,
    ttlSeconds: number
  ): Promise<void> {
    const existing = this.records.get(key);
    if (!existing || existing.lockId !== lockId) {
      return;
    }

    this.records.set(key, {
      status: 'COMPLETED',
      payloadHash: existing.payloadHash,
      lockId,
      responseStatus,
      responseBody,
      expiresAt: Date.now() + ttlSeconds * 1000
    });
  }

  async releaseIfOwned(key: string, lockId: string): Promise<void> {
    const existing = this.records.get(key);
    if (existing && existing.status === 'PROCESSING' && existing.lockId === lockId) {
      this.records.delete(key);
    }
  }

  private sweepExpired(now: number): void {
    for (const [k, record] of this.records) {
      if (record.expiresAt <= now) {
        this.records.delete(k);
      }
    }
  }
}

class IdempotencyPayloadMismatchError extends Error {
  readonly status = 422;
  constructor() {
    super('Idempotency key reused with a different request payload');
    this.name = 'IdempotencyPayloadMismatchError';
  }
}

class IdempotencyInProgressError extends Error {
  readonly status = 409;
  constructor() {
    super('Concurrent request in progress for this idempotency key');
    this.name = 'IdempotencyInProgressError';
  }
}

interface ProcessOptions<T> {
  key: string;
  payloadHash: string;
  store: IdempotencyStore;
  ttlSeconds?: number;
  lockTtlSeconds?: number;
  execute: () => Promise<{ status: number; body: T }>;
}

async function processIdempotentRequest<T>({
  key,
  payloadHash,
  store,
  ttlSeconds = 86400,
  lockTtlSeconds = 30,
  execute
}: ProcessOptions<T>): Promise<{ status: number; body: T; cached: boolean }> {
  if (!key) {
    throw new RangeError('Idempotency key must not be empty');
  }

  const acquisition = await store.acquire(key, payloadHash, lockTtlSeconds);

  if (!acquisition.acquired) {
    const { existing } = acquisition;
    if (existing.payloadHash !== payloadHash) {
      throw new IdempotencyPayloadMismatchError();
    }
    if (existing.status === 'PROCESSING') {
      throw new IdempotencyInProgressError();
    }
    return {
      status: existing.responseStatus ?? 200,
      body: (existing.responseBody !== undefined ? JSON.parse(existing.responseBody) : undefined) as T,
      cached: true
    };
  }

  let result: { status: number; body: T };
  try {
    result = await execute();
  } catch (error) {
    // Release transient PROCESSING lock only on pre-commit execution failure so safe retries can proceed
    await store.releaseIfOwned(key, acquisition.lockId);
    throw error;
  }

  const serializedBody = result.body === undefined ? undefined : JSON.stringify(result.body);
  await store.completeIfOwned(key, acquisition.lockId, result.status, serializedBody, ttlSeconds);

  return {
    status: result.status,
    body: result.body,
    cached: false
  };
}

export {
  processIdempotentRequest,
  InMemoryIdempotencyStore,
  IdempotencyPayloadMismatchError,
  IdempotencyInProgressError
};
export type { IdempotencyRecord, IdempotencyStore, AcquireResult, ProcessOptions };
