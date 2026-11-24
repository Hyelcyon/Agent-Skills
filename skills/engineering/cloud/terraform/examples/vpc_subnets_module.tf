variable "vpc_cidr" {
  type        = string
  description = "CIDR block for the VPC."

  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))
    error_message = "Variable 'vpc_cidr' must be a valid IPv4 CIDR string."
  }
}

variable "availability_zones" {
  type        = list(string)
  description = "Target availability zones for subnets."

  validation {
    condition     = length(var.availability_zones) >= 2
    error_message = "At least two availability zones are required for high availability."
  }
}

variable "environment" {
  type        = string
  description = "Deployment environment tier."

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Variable 'environment' must be 'dev', 'staging', or 'prod'."
  }
}

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.environment}-vpc"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_subnet" "private" {
  for_each = {
    for idx, az in var.availability_zones : az => cidrsubnet(var.vpc_cidr, 4, idx)
  }

  vpc_id            = aws_vpc.main.id
  cidr_block        = each.value
  availability_zone = each.key

  tags = {
    Name        = "${var.environment}-private-${each.key}"
    Environment = var.environment
    Tier        = "Private"
  }

  lifecycle {
    create_before_destroy = true
  }
}

output "vpc_id" {
  description = "Identifier of the created VPC."
  value       = aws_vpc.main.id
}

output "private_subnet_ids" {
  description = "List of private subnet IDs."
  value       = [for subnet in aws_subnet.private : subnet.id]
}
