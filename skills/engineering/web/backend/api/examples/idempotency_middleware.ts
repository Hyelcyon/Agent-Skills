interface IdempotencyRecord {
  status: 'PROCESSING' | 'COMPLETED';
  responseStatus?: number;
  responseBody?: string;
  createdAt: number;
}

interface IdempotencyStore {
  get(key: string): Promise<IdempotencyRecord | null>;
  set(key: string, record: IdempotencyRecord, ttlSeconds: number): Promise<void>;
}

class InMemoryIdempotencyStore implements IdempotencyStore {
  private readonly records = new Map<string, IdempotencyRecord>();

  async get(key: string): Promise<IdempotencyRecord | null> {
    return this.records.get(key) ?? null;
  }

  async set(key: string, record: IdempotencyRecord): Promise<void> {
    this.records.set(key, record);
  }
}

interface ProcessOptions<T> {
  key: string;
  store: IdempotencyStore;
  ttlSeconds?: number;
  execute: () => Promise<{ status: number; body: T }>;
}

async function processIdempotentRequest<T>({
  key,
  store,
  ttlSeconds = 86400,
  execute
}: ProcessOptions<T>): Promise<{ status: number; body: T; cached: boolean }> {
  const existing = await store.get(key);

  if (existing) {
    if (existing.status === 'PROCESSING') {
      throw new Error('Concurrent request in progress for this idempotency key');
    }
    if (existing.status === 'COMPLETED' && existing.responseBody) {
      return {
        status: existing.responseStatus ?? 200,
        body: JSON.parse(existing.responseBody) as T,
        cached: true
      };
    }
  }

  await store.set(key, { status: 'PROCESSING', createdAt: Date.now() }, ttlSeconds);

  try {
    const result = await execute();
    await store.set(
      key,
      {
        status: 'COMPLETED',
        responseStatus: result.status,
        responseBody: JSON.stringify(result.body),
        createdAt: Date.now()
      },
      ttlSeconds
    );

    return {
      status: result.status,
      body: result.body,
      cached: false
    };
  } catch (error) {
    throw error;
  }
}

export { processIdempotentRequest, InMemoryIdempotencyStore };
export type { IdempotencyRecord, IdempotencyStore, ProcessOptions };
