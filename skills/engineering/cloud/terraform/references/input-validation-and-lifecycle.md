# Input Validation, Custom Conditions, and Lifecycle Safety

This document covers variable validation protocols, lifecycle meta-arguments, and preconditions/postconditions in Terraform.

---

## 1. Defensive Variable Validation

Input variables should catch invalid configurations during `terraform plan` rather than failing mid-apply after cloud API calls have started.

### Validation Rules Patterns
```hcl
variable "cidr_block" {
  type        = string
  description = "IPv4 CIDR block for the VPC."

  validation {
    condition     = can(cidrhost(var.cidr_block, 0))
    error_message = "The 'cidr_block' value must be a valid IPv4 CIDR notation (e.g., 10.0.0.0/16)."
  }
}

variable "instance_count" {
  type        = number
  description = "Desired number of worker instances."

  validation {
    condition     = var.instance_count >= 2 && var.instance_count <= 50
    error_message = "The 'instance_count' must be between 2 and 50 inclusive."
  }
}

variable "database_tier" {
  type        = string
  description = "RDS DB instance class."

  validation {
    condition     = startswith(var.database_tier, "db.r6g.") || startswith(var.database_tier, "db.m6g.")
    error_message = "Production databases must utilize AWS Graviton 'db.r6g' or 'db.m6g' instance families."
  }
}
```

---

## 2. Resource Lifecycle Meta-Arguments

Lifecycle meta-arguments instruct the state graph engine on how to handle creation, replacement, and external modifications.

### 2.1 `create_before_destroy`
By default, when a resource replacement is required (e.g., changing an immutable subnet or autoscaling launch configuration), Terraform destroys the existing resource first, then creates the replacement. This causes an outage window.
- **Rule**: Set `create_before_destroy = true` for zero-downtime replacements.
```hcl
resource "aws_launch_template" "worker" {
  name_prefix   = "worker-node-"
  image_id      = var.ami_id
  instance_type = var.instance_type

  lifecycle {
    create_before_destroy = true
  }
}
```

### 2.2 `prevent_destroy`
Stops Terraform from executing any plan that would destroy the target resource.
- **Rule**: Apply to stateful resources (RDS, S3 buckets, KMS keys).
```hcl
resource "aws_db_instance" "production_db" {
  identifier        = "corp-production-postgres"
  allocated_storage = 100
  engine            = "postgres"

  lifecycle {
    prevent_destroy = true
  }
}
```

### 2.3 `precondition` and `postcondition`
Ensures state assertions pass before resource creation or evaluates attributes returned by the cloud provider post-creation:
```hcl
resource "aws_instance" "web" {
  ami           = var.ami_id
  instance_type = var.instance_type

  lifecycle {
    precondition {
      condition     = data.aws_ami.selected.architecture == "arm64"
      error_message = "AMI must target the ARM64 Graviton architecture."
    }

    postcondition {
      condition     = self.associate_public_ip_address == false
      error_message = "Internal web servers must not be assigned public IP addresses."
    }
  }
}
```
