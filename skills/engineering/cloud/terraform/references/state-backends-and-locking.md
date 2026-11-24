# Remote State Backends, Distributed Locking, and Blast Radius Layering

This document outlines state architecture, concurrency locking mechanics, and state separation topologies for enterprise Terraform.

---

## 1. Concurrency Locking Mechanics

When multiple engineers or CI/CD pipelines run `terraform plan` or `terraform apply` concurrently, state corruption occurs unless a distributed lock is acquired.

```
CI Pipeline / Engineer A              CI Pipeline / Engineer B
          |                                      |
          v                                      v
  Acquire Mutex Lock                    Acquire Mutex Lock
  (e.g., DynamoDB / GCS)                 (Lock ALREADY held!)
          |                                      |
     Lock Granted                           Lock Denied
          |                                      |
  Read Remote State                     Terminates with Error:
  Compute Plan / Apply Changes          "Error acquiring the state lock"
  Write Updated State                            x
  Release Mutex Lock
```

### AWS S3 + DynamoDB Lock Schema
In AWS environments, the S3 backend stores the `.tfstate` blob with server-side encryption (KMS or AES-256), while DynamoDB provides strong consistency for locking:
- **Partition Key**: `LockID` (String)
- **Lock Attribute Payload**: Contains the execution ID, machine hostname, timestamp, and lock owner.

### Handling Stuck Locks Safely
If an execution process crashes violently (e.g., runner OOMKill) before releasing the lock, the lock must be investigated before unlocking:
```bash
# Verify who holds the lock and the timestamp
terraform force-unlock <LOCK-ID>
```
*Warning*: Never run `force-unlock` while a remote CI job is actively running; doing so risks catastrophic split-brain state divergence.

---

## 2. Blast Radius Layering & State Isolation

Monolithic state files where VPCs, databases, and microservices live together are a critical architectural failure mode:
1. `terraform plan` becomes unacceptably slow (polling hundreds of cloud APIs).
2. A typo in an application resource can accidentally tear down shared networking.
3. Access control (RBAC) cannot be segregated across platform and product teams.

### The 3-Tier Layered Architecture
```
+-------------------------------------------------------------+
| Layer 1: Networking & Foundation (VPCs, Subnets, Transit GW)|
| Slow change frequency. Managed by Network/Infra Engineers. |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
| Layer 2: Platform & Shared Data (EKS, RDS Clusters, Kafka)  |
| Medium change frequency. Consumes Layer 1 via data sources. |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
| Layer 3: Application Workloads (Deployments, Ingress, IAM)  |
| High change frequency. Consumes Layer 2. Independent state. |
+-------------------------------------------------------------+
```

### Consuming Upstream Layers via `terraform_remote_state`
Downstream states consume upstream outputs in read-only mode:
```hcl
data "terraform_remote_state" "network" {
  backend = "s3"
  config = {
    bucket = "corp-terraform-state-prod"
    key    = "foundation/vpc/terraform.tfstate"
    region = "us-east-1"
  }
}

resource "aws_security_group" "app" {
  name   = "app-sg"
  vpc_id = data.terraform_remote_state.network.outputs.vpc_id
}
```
