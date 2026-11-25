interface EphemeralCredential {
  readonly username: string;
  readonly secretToken: string;
  readonly validUntil: number;
}

type LeaseFetcher = () => Promise<EphemeralCredential>;

class EphemeralSecretManager {
  private cachedCredential: EphemeralCredential | null = null;
  private inflightRequest: Promise<EphemeralCredential> | null = null;
  private readonly fetchLease: LeaseFetcher;

  constructor(fetchLease: LeaseFetcher) {
    this.fetchLease = fetchLease;
  }

  async getValidCredential(): Promise<EphemeralCredential> {
    const now = Date.now();
    if (this.cachedCredential && this.cachedCredential.validUntil > now + 30000) {
      return this.cachedCredential;
    }

    // Coalesce concurrent cold-start or expiry callers onto a single Vault lease request
    if (!this.inflightRequest) {
      this.inflightRequest = this.fetchLease()
        .then((fetched) => {
          this.cachedCredential = fetched;
          return fetched;
        })
        .finally(() => {
          this.inflightRequest = null;
        });
    }

    return this.inflightRequest;
  }
}

export { EphemeralSecretManager };
export type { EphemeralCredential, LeaseFetcher };
