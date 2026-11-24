# Reusable Module Architecture and Non-Destructive Refactoring

This document covers best practices for authoring enterprise Terraform child modules and utilizing native HCL `moved` blocks for zero-downtime refactoring.

---

## 1. Reusable Module Design Standards

Enterprise modules must behave like pure functions: explicit inputs (`variables.tf`), encapsulated resources (`main.tf`), and well-typed outputs (`outputs.tf`).

### Directory Layout
```
modules/rds_postgres/
├── main.tf          # Core resources (aws_db_instance, aws_db_parameter_group)
├── variables.tf     # Strictly typed input variables with validations
├── outputs.tf       # Exported connection endpoints and identifiers
├── versions.tf      # Minimal required Terraform & provider constraints
└── README.md        # Generated documentation
```

### Critical Module Invariants
1. **Never Declare `provider` Blocks Inside Reusable Modules**: Providers must be configured by the root module caller. Declaring provider blocks inside child modules prevents module reuse across multiple AWS regions or accounts.
2. **Expose Computed Identifiers**: Always output resource IDs, ARNs, and security group IDs so calling modules can wire dependencies without data-source lookups.
3. **Use Sensible Defaults, Require Critical Contracts**: Provide defaults for non-critical knobs (e.g. `monitoring_interval = 60`), but leave critical infrastructure decisions (e.g. `vpc_id`, `subnet_ids`) without defaults so callers are forced to specify them explicitly.

---

## 2. Refactoring Without Destruction: The `moved` Block Standard

In legacy Terraform (prior to v1.1), renaming a resource identifier or moving a resource into a child module caused Terraform to propose:
- Destroying the existing resource at `aws_db_instance.primary`
- Creating a new resource at `aws_db_instance.db`

In production, this caused massive data loss or extended downtime.

### Syntax and Mechanics
Terraform v1.1+ introduced the declarative `moved` block. When Terraform evaluates state during `plan`, it maps the old address to the new address in memory without touching the physical cloud infrastructure:

```hcl
# 1. Renaming a resource within the same module
resource "aws_s3_bucket" "assets" {
  bucket = "company-public-assets"
}

moved {
  from = aws_s3_bucket.public_assets
  to   = aws_s3_bucket.assets
}
```

### Refactoring Into a Child Module
When migrating standalone resources into a reusable module:
```hcl
module "networking" {
  source = "./modules/vpc"
  cidr   = "10.0.0.0/16"
}

# Inform Terraform that the VPC was moved into the module
moved {
  from = aws_vpc.main
  to   = module.networking.aws_vpc.this
}

# Inform Terraform that the subnets were moved
moved {
  from = aws_subnet.public[0]
  to   = module.networking.aws_subnet.public[0]
}
```

### Verification Gate
When running `terraform plan`, verify that the output states:
```
Plan: 0 to add, 0 to change, 0 to destroy.
```
If the plan displays `1 to add, 1 to destroy`, the `moved` block address is incorrect and must not be applied.
