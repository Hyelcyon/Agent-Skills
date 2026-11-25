interface CachedSecret {
  value: string;
  expiresAt: number;
}

export class SecretsCacheManager {
  private cache: Map<string, CachedSecret> = new Map();
  private readonly inFlight: Map<string, Promise<string>> = new Map();
  private ttlMs: number;

  constructor(ttlMs: number = 300000) {
    this.ttlMs = ttlMs;
  }

  async getSecret(secretId: string, fetcher: (id: string) => Promise<string>): Promise<string> {
    const cached = this.cache.get(secretId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    let pending = this.inFlight.get(secretId);
    if (!pending) {
      pending = fetcher(secretId)
        .then((freshValue) => {
          this.cache.set(secretId, {
            value: freshValue,
            expiresAt: Date.now() + this.ttlMs
          });
          return freshValue;
        })
        .finally(() => {
          this.inFlight.delete(secretId);
        });
      this.inFlight.set(secretId, pending);
    }

    return pending;
  }

  evict(secretId: string): void {
    this.cache.delete(secretId);
  }
}
