terraform {
  backend "s3" {
    bucket         = "corp-terraform-state-prod"
    key            = "platform/kubernetes/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "corp-terraform-state-locks"
  }
}
