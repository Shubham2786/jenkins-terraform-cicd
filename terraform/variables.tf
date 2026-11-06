variable "aws_region" {
  description = "The AWS region where infrastructure will be provisioned"
  type        = string
  default     = "eu-west-1"
}

variable "project_name" {
  description = "Project name used for tagging and resource naming"
  type        = string
  default     = "devops-cicd-dashboard"
}

variable "environment" {
  description = "Target deployment environment (e.g. dev, staging, production)"
  type        = string
  default     = "production"
}

variable "vpc_cidr" {
  description = "CIDR block for the custom VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR block for the public subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "availability_zone" {
  description = "Specific Availability Zone for the subnet (leave blank to select first available)"
  type        = string
  default     = ""
}

variable "ami_id" {
  description = "AMI ID for the Ubuntu EC2 instance"
  type        = string
  default     = "ami-0aacd9f2ec3771e2f"
}

variable "instance_type" {
  description = "EC2 instance type for running Docker and the Next.js container"
  type        = string
  default     = "t2.micro"
}

variable "ssh_allowed_cidr" {
  description = "CIDR block authorized for SSH administration (restrict to trusted IP)"
  type        = string
  default     = "0.0.0.0/0"
}

variable "key_name" {
  description = "Existing AWS EC2 Key Pair name for SSH access"
  type        = string
  default     = ""
}

variable "app_port" {
  description = "Application listening port on container"
  type        = number
  default     = 3000
}

variable "root_volume_size" {
  description = "Root EBS storage volume size in GB"
  type        = number
  default     = 20
}

