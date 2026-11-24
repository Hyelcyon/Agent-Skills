# Vault Dynamic Secrets, Ephemeral Leasing, and Credential Brokering

Architectural standards for zero-static secrets, HashiCorp Vault dynamic secret engines, lease renewals, and automated database credential rotation.

## 1. Dynamic Secrets Architecture

Static secrets (passwords and API keys that exist indefinitely until manually replaced) eventually leak through backups, logs, developer environments, or compromised hosts.

Dynamic secrets do not exist until requested by an application. Vault generates unique, ephemeral credentials on demand with a strict Time-To-Live (TTL). When the lease expires, Vault automatically revokes the credentials in the target database or cloud provider.

```
Application ──(1. Authenticate via OIDC/AppRole)──► HashiCorp Vault
     │                                                     │
     │◄──(2. Returns username, password, lease_id, TTL)────┘
     │
     ▼
Database (Target PostgreSQL / MySQL)
(User created dynamically by Vault with strict TTL)
```

---

## 2. Managing Leases and Background Renewals

When an application receives dynamic credentials, it must maintain the lease or gracefully request new credentials before expiration.

### Automated Lease Renewal Flow

```typescript
export interface VaultDynamicSecret {
  leaseId: string;
  leaseDurationSeconds: number;
  renewable: boolean;
  data: {
    username: string;
    password: string;
  };
}

export class VaultLeaseManager {
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly vaultEndpoint: string,
    private readonly clientToken: string
  ) {}

  public scheduleRenewal(secret: VaultDynamicSecret): void {
    if (!secret.renewable) {
      return;
    }

    const intervalMs = (secret.leaseDurationSeconds * 1000) / 2;
    this.timer = setTimeout(async () => {
      await this.renew(secret.leaseId, secret.leaseDurationSeconds);
    }, intervalMs);
  }

  private async renew(leaseId: string, duration: number): Promise<void> {
    await fetch(`${this.vaultEndpoint}/v1/sys/leases/renew`, {
      method: 'POST',
      headers: {
        'X-Vault-Token': this.clientToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lease_id: leaseId,
        increment: duration,
      }),
    });
  }
}
```

Renewing the lease at 50% of the total lease duration ensures that intermittent network partitions do not cause the lease to lapse prematurely.

---

## 3. Database Dynamic Roles Configuration

Configure database engines in Vault to grant scoped SQL permissions to dynamically generated users:

```sql
CREATE ROLE "app-readonly" WITH
  LOGIN
  PASSWORD '{{password}}'
  VALID UNTIL '{{expiration}}';

GRANT SELECT ON ALL TABLES IN SCHEMA public TO "app-readonly";
```

Vault substitutes `{{password}}` and `{{expiration}}` automatically, creating isolated database users per running instance.
