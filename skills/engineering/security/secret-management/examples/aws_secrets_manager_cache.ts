interface CachedSecret {
  value: string;
  expiresAt: number;
}

export class SecretsCacheManager {
  private cache: Map<string, CachedSecret> = new Map();
  private ttlMs: number;

  constructor(ttlMs: number = 300000) {
    this.ttlMs = ttlMs;
  }

  async getSecret(secretId: string, fetcher: (id: string) => Promise<string>): Promise<string> {
    const now = Date.now();
    const cached = this.cache.get(secretId);

    if (cached && cached.expiresAt > now) {
      return cached.value;
    }

    const freshValue = await fetcher(secretId);
    this.cache.set(secretId, {
      value: freshValue,
      expiresAt: now + this.ttlMs
    });

    return freshValue;
  }

  evict(secretId: string): void {
    this.cache.delete(secretId);
  }
}
