# ==============================================================================
# Root Module: Orchestrator for Modular AWS Infrastructure
# Connects: Networking Module -> Security Group Module -> EC2 Compute Module
# ==============================================================================

# 1. Modular Networking Provisioning
module "networking" {
  source = "./modules/networking"

  vpc_cidr           = var.vpc_cidr
  public_subnet_cidr = var.public_subnet_cidr
  availability_zone  = var.availability_zone
  project_name       = var.project_name
  environment        = var.environment
}

# 2. Modular Security Group Provisioning
module "security_group" {
  source = "./modules/security-group"

  vpc_id           = module.networking.vpc_id
  ssh_allowed_cidr = var.ssh_allowed_cidr
  app_port         = var.app_port
  project_name     = var.project_name
  environment      = var.environment
}

# 3. Modular EC2 Compute & Container Host Provisioning
module "ec2" {
  source = "./modules/ec2"

  ami_id            = var.ami_id
  subnet_id         = module.networking.public_subnet_id
  security_group_id = module.security_group.security_group_id
  instance_type     = var.instance_type
  key_name          = var.key_name
  root_volume_size  = var.root_volume_size
  project_name      = var.project_name
  environment       = var.environment
}

