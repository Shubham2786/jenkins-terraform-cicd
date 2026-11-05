variable "vpc_id" {
  description = "The ID of the VPC where the security group will be created"
  type        = string
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

variable "ssh_allowed_cidr" {
  description = "The CIDR block allowed to access the EC2 instance via SSH. Restrict to trusted IP for security."
  type        = string
  default     = "0.0.0.0/0"
}

variable "app_port" {
  description = "The port on which the Next.js application container listens"
  type        = number
  default     = 3000
}

