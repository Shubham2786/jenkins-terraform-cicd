# ==============================================================================
# Root Module Outputs
# Exposes connection details, resource IDs, and application URLs
# ==============================================================================

output "instance_id" {
  description = "The AWS EC2 Instance ID"
  value       = module.ec2.instance_id
}

output "public_ip" {
  description = "The public IPv4 address of the EC2 instance"
  value       = module.ec2.public_ip
}

output "public_dns" {
  description = "The public DNS name of the EC2 instance"
  value       = module.ec2.public_dns
}

output "private_ip" {
  description = "The private IPv4 address of the EC2 instance"
  value       = module.ec2.private_ip
}

output "application_url" {
  description = "The HTTP URL to access the deployed Next.js application"
  value       = "http://${module.ec2.public_ip}:${var.app_port}"
}

output "vpc_id" {
  description = "The ID of the custom VPC"
  value       = module.networking.vpc_id
}

output "public_subnet_id" {
  description = "The ID of the public subnet"
  value       = module.networking.public_subnet_id
}

output "security_group_id" {
  description = "The ID of the EC2 security group"
  value       = module.security_group.security_group_id
}

