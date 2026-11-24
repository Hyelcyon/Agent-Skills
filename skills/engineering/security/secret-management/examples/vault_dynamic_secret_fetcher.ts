interface EphemeralCredential {
  readonly username: string;
  readonly secretToken: string;
  readonly validUntil: number;
}

class EphemeralSecretManager {
  private cachedCredential: EphemeralCredential | null = null;

  async getValidCredential(): Promise<EphemeralCredential> {
    const now = Date.now();
    if (this.cachedCredential && this.cachedCredential.validUntil > now + 30000) {
      return this.cachedCredential;
    }

    const fetched = await this.requestDynamicLease();
    this.cachedCredential = fetched;
    return fetched;
  }

  private async requestDynamicLease(): Promise<EphemeralCredential> {
    return {
      username: 'app_worker_temp',
      secretToken: 'ephemeral_token_sample',
      validUntil: Date.now() + 900000
    };
  }
}

export { EphemeralSecretManager };
export type { EphemeralCredential };
