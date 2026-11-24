# Example demonstrating non-destructive state refactoring using HCL moved blocks.

variable "bucket_name" {
  type        = string
  description = "Unique name for the S3 bucket."
}

# The resource was previously named 'aws_s3_bucket.legacy_storage'
# and has now been renamed to 'aws_s3_bucket.primary_storage'.
resource "aws_s3_bucket" "primary_storage" {
  bucket = var.bucket_name

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_versioning" "primary_storage" {
  bucket = aws_s3_bucket.primary_storage.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "primary_storage" {
  bucket = aws_s3_bucket.primary_storage.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Declarative moved blocks map old state addresses to new addresses in memory.
moved {
  from = aws_s3_bucket.legacy_storage
  to   = aws_s3_bucket.primary_storage
}

moved {
  from = aws_s3_bucket_versioning.legacy
  to   = aws_s3_bucket_versioning.primary_storage
}

output "bucket_arn" {
  description = "ARN of the primary storage bucket."
  value       = aws_s3_bucket.primary_storage.arn
}
