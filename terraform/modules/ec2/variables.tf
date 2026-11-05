variable "instance_type" {
  description = "EC2 instance type (low-cost, suitable for container workloads)"
  type        = string
  default     = "t2.micro"
}

variable "subnet_id" {
  description = "The VPC subnet ID where the EC2 instance will be deployed"
  type        = string
}

variable "security_group_id" {
  description = "The security group ID to associate with the EC2 instance"
  type        = string
}

variable "key_name" {
  description = "The AWS EC2 Key Pair name for SSH authentication"
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

variable "root_volume_size" {
  description = "Root EBS volume size in GB"
  type        = number
  default     = 20
}

