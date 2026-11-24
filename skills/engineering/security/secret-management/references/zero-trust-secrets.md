# Zero-Trust Secrets Architecture Playbook

Detailed reference for Secret Zero resolution, Kubernetes External Secrets Operator (ESO), and rotation workflows.

---

## 1. Resolving the "Secret Zero" Dilemma

Never bootstrap secret management using another static API key:
- **Kubernetes**: Use Kubernetes Service Account Tokens (Projected Service Account Tokens) verified against Vault OIDC.
- **AWS**: Use IAM Roles for Service Accounts (IRSA) or EC2 Instance Metadata Service (IMDSv2).
- **GCP**: Use Workload Identity Federation.

---

## 2. Kubernetes External Secrets Operator (ESO) Pattern

Decouple application pods from Vault APIs by syncing secrets natively into in-memory Kubernetes Secrets:

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: database-credentials
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: vault-backend
    kind: ClusterSecretStore
  target:
    name: app-db-secret
  data:
    - secretKey: DB_PASSWORD
      remoteRef:
        key: secret/data/database
        property: password
```
