# ──────────────────────────────────────────────
# OPTIONAL — You already created your S3 bucket manually.
# This file exists only if you want to manage it via Terraform later.
# Keep this in a SEPARATE state from compute/ so "terraform destroy"
# on compute/ never deletes your PDFs.
# ──────────────────────────────────────────────

terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  type    = string
  default = "ap-south-1"
}

variable "bucket_name" {
  description = "Globally unique S3 bucket name for Pioneer PDF storage"
  type        = string
}

resource "aws_s3_bucket" "pioneer_pdfs" {
  bucket = var.bucket_name

  tags = {
    Name    = "pioneer-pdfs"
    Project = "pioneer"
  }

  # Prevent accidental deletion
  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_public_access_block" "pioneer_pdfs" {
  bucket = aws_s3_bucket.pioneer_pdfs.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

output "bucket_arn" {
  value = aws_s3_bucket.pioneer_pdfs.arn
}

output "bucket_domain" {
  value = aws_s3_bucket.pioneer_pdfs.bucket_regional_domain_name
}
