---
name: terraform
description: Use when authoring, refactoring, or auditing Terraform (v1.8 - v1.10+) and OpenTofu infrastructure as code, designing reusable modules, configuring remote state locking, lifecycle rules, input validations, or refactoring state via moved blocks.
---

# Terraform & OpenTofu Enterprise Architecture Standard

This skill establishes the production standard for declarative Infrastructure as Code (IaC) using Terraform (v1.8+) and OpenTofu. It mandates zero-downtime refactoring, state lock integrity, defensive validation rules, and strict separation between environment states.

---

## 1. Senior Craftsmanship Principles

1. **State Isolation & Remote Locking**: Never store state locally or in source control. State must reside in an encrypted remote backend with distributed mutex locking (e.g. AWS S3 + DynamoDB or GCS). Split states by blast radius (network, data, compute) rather than maintaining monolithic state files.
2. **Deterministic Provider Pinning**: Always declare strict version constraints in `required_providers`. Restrict major version shifts using pessimistic constraint operators (`~> 5.40`).
3. **Non-Destructive Refactoring via `moved` Blocks**: Never destroy and recreate production resources solely to rename an identifier or extract a child module. Use native HCL `moved` blocks to inform the state engine of address transformations.
4. **Input Defense with Custom Validation**: Every variable without an obvious primitive scalar must declare `validation` blocks with clear error messages.
5. **Lifecycle Safety Guardrails**:
   - `prevent_destroy = true`: Protect persistent databases, KMS keys, and primary VPCs against accidental deletion.
   - `create_before_destroy = true`: Mandate on TLS certificates, autoscaling launch templates, and DNS records to prevent routing blackholes.

---

## 2. Hard Anti-Patterns (Prohibited)

| Anti-Pattern | Operational Risk | Production Remedy |
| :--- | :--- | :--- |
| Local `terraform.tfstate` | Concurrent plan collisions; unencrypted state containing secrets | Enforce remote backend with locking (DynamoDB / GCS) |
| `terraform apply -auto-approve` in CI | Uninspected destructive actions (drops databases/subnets) | Enforce plan artifact workflow: `plan -out=tfplan` -> manual review gate -> `apply tfplan` |
| Renaming resource addresses without `moved` | Destroys active resource and creates new one, causing downtime | Declare `moved { from = old.name; to = new.name }` |
| Hardcoding secrets or credentials in `.tf` | Secret exposure in version control and state leaks | Use dynamic vault data sources or environment variables (`TF_VAR_...`) |
| Monolithic state for entire enterprise | Slow execution, lock contention, catastrophic blast radius | Layer state into Foundation (VPC), Platform (EKS/RDS), and Application tiers |
| `ignore_changes = all` | Complete blindspot to out-of-band drifts and security regressions | Restrict `ignore_changes` to specific tags or autoscaling attributes |

---

## 3. The 5-Phase Terraform Operational Protocol

```
+-------------------------------------------------------------+
| Phase 1: Backend & State Profiling                         |
| Verify remote backend, state lock table & provider versions |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
| Phase 2: Variable Contract & Policy Shielding               |
| Enforce variable validation rules, sensitive flags, tflint  |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
| Phase 3: Deterministic Surgical Manifest Authoring          |
| Author HCL with lifecycle rules, dynamic blocks, moved logic|
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
| Phase 4: Plan Artifact Generation & Review Gate             |
| Execute terraform plan -out=tfplan; verify zero drops       |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
| Phase 5: Controlled Application & Drift Audit               |
| Apply exact plan artifact; verify state and idempotency     |
+-------------------------------------------------------------+
```

### Phase 1: Backend & State Profiling
Initialize working directory with backend verification:
```bash
# Verify backend configuration and download locked provider plugins
terraform init -backend=true -upgrade=false

# Inspect current state list and verify lock integrity
terraform state list
```

### Phase 2: Variable Contract & Policy Shielding
Define robust input variables with runtime constraints:
```hcl
variable "environment" {
  type        = string
  description = "Target deployment environment."

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Variable 'environment' must be one of: 'dev', 'staging', 'prod'."
  }
}
```

### Phase 3: Deterministic Surgical Manifest Authoring
Implement resources with lifecycle defenses and `moved` declarations:
```hcl
resource "aws_security_group" "alb" {
  name_prefix = "${var.environment}-alb-"
  vpc_id      = var.vpc_id

  lifecycle {
    create_before_destroy = true
    prevent_destroy       = false
  }
}

moved {
  from = aws_security_group.web_alb
  to   = aws_security_group.alb
}
```

### Phase 4: Plan Artifact Generation & Review Gate
Generate deterministic plan file and verify change summary:
```bash
# Lint syntax and provider rules
tflint

# Format validation
terraform fmt -check -diff

# Generate isolated plan artifact
terraform plan -out=tfplan -detailed-exitcode

# Inspect planned actions (must show 0 to destroy unless explicitly planned)
terraform show -json tfplan | jq '.resource_changes[] | select(.change.actions[] == "delete")'
```

### Phase 5: Controlled Application & Drift Audit
Apply the identical binary plan file to eliminate race conditions:
```bash
# Apply exact plan artifact
terraform apply tfplan

# Verify idempotency (must return exit code 0 and 'No changes')
terraform plan -detailed-exitcode
```

---

## 4. Deep References & Production Assets

- [State Backends and Locking Reference](./references/state-backends-and-locking.md)
- [Module Architecture and Moved Blocks Reference](./references/module-architecture-and-moved-blocks.md)
- [Input Validation and Lifecycle Reference](./references/input-validation-and-lifecycle.md)
- [S3 Remote Backend Template](./resources/backend.s3.tf)
- [Provider Versions Template](./resources/versions.tf)
- [TFLint Production Ruleset](./resources/.tflint.hcl)
- [VPC Subnets Module Example](./examples/vpc_subnets_module.tf)
- [Refactor with Moved Blocks Example](./examples/refactor_with_moved_blocks.tf)
- [Drift Detector Automation Script](./examples/drift_detector.sh)
