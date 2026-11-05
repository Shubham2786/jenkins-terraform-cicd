variable "vpc_cidr" {
  description = "The CIDR block for the custom VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "The CIDR block for the public subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "availability_zone" {
  description = "The AWS Availability Zone to launch the public subnet in"
  type        = string
  default     = ""
}

variable "project_name" {
  description = "The project name used for resource naming and tagging"
  type        = string
  default     = "devops-cicd-dashboard"
}

variable "environment" {
  description = "Deployment environment (e.g., dev, staging, production)"
  type        = string
  default     = "production"
}

