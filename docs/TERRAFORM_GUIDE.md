# Terraform Infrastructure as Code (IaC) Guide

This guide explains how to manage, validate, provision, and destroy the AWS cloud infrastructure for the **DevOps CI/CD Automation Dashboard** using modular Terraform.

---

## 1. Modular Architecture Overview

The Terraform configuration strictly implements a **Root Module + Reusable Child Modules** architecture:

```text
terraform/
├── main.tf                    # Root orchestrator: passes outputs between child modules
├── provider.tf                # AWS Provider configuration with unified project tags
├── versions.tf                # Terraform (>= 1.5.0) and AWS Provider (~> 5.0) versions
├── variables.tf               # Root input variables with defaults and descriptions
├── outputs.tf                 # Exposes EC2 IP, DNS, URLs, VPC, and SG IDs
├── terraform.tfvars.example   # Template configuration file
│
└── modules/
    ├── networking/            # Custom VPC, Internet Gateway, Public Subnet, Route Tables
    ├── security-group/        # EC2 Security Group (SSH, HTTP 80, App Port 3000, Egress)
    └── ec2/                   # Dynamic Ubuntu 22.04 LTS AMI, EC2 Instance, User Data
```

### Why Modular IaC?
- **Separation of Concerns**: Network rules are decoupled from compute instances.
- **Maintainability & Reusability**: Child modules can be independently versioned or reused across multiple environments (`dev`, `staging`, `production`).
- **Deterministic Dependency Graph**: The root module wires `module.networking.vpc_id` into `module.security_group`, and wires subnet and security group IDs into `module.ec2`.

---

## 2. Prerequisites & AWS Authentication

Before running Terraform commands:
1. Install Terraform CLI (version 1.5.0 or newer).
2. Configure AWS CLI credentials:
   ```bash
   aws configure
   # Enter AWS Access Key ID: ********************
   # Enter AWS Secret Access Key: ********************
   # Default region name: eu-west-1
   # Default output format: json
   ```
3. Alternatively, export environment variables:
   ```bash
   export AWS_ACCESS_KEY_ID="your-access-key-id"
   export AWS_SECRET_ACCESS_KEY="your-secret-access-key"
   export AWS_DEFAULT_REGION="eu-west-1"
   ```

> **SECURITY NOTE**: Never hardcode AWS keys inside `.tf` files or commit credentials to Git.

---

## 3. Step-by-Step Execution Workflow

Navigate to the `terraform/` directory:
```bash
cd terraform
```

### Step 1: Initialize Working Directory (`init`)
Initializes child modules, backend, and downloads the AWS provider plugin:
```bash
terraform init
```

### Step 2: Canonical Code Formatting (`fmt`)
Formats all `.tf` files across root and child modules to HashiCorp standard styling:
```bash
terraform fmt -recursive
```

### Step 3: Syntax & Configuration Validation (`validate`)
Verifies internal consistency, resource arguments, and module attribute references:
```bash
terraform validate
```
Expected output:
```text
Success! The configuration is valid.
```

### Step 4: Configuration File Setup (`terraform.tfvars`)
Create your custom variable file from the provided example template:
```bash
cp terraform.tfvars.example terraform.tfvars
```
Edit `terraform.tfvars`:
```hcl
aws_region         = "eu-west-1"
project_name       = "devops-cicd-dashboard"
environment        = "production"
instance_type      = "t2.micro"
ami_id             = "ami-0aacd9f2ec3771e2f"
key_name           = "your-ec2-keypair-name" # Replace with your existing EC2 KeyPair
ssh_allowed_cidr   = "0.0.0.0/0"             # Restrict to your workstation IP for security
app_port           = 3000
```

### Step 5: Generate Execution Plan (`plan`)
Simulates what resources will be created without making real cloud modifications:
```bash
terraform plan -out=tfplan
```
Review the proposed changes (e.g., `Plan: 7 to add, 0 to change, 0 to destroy`).

### Step 6: Provision Infrastructure (`apply`)
Applies the plan to provision the VPC, subnet, gateway, route tables, security group, and EC2 instance:
```bash
terraform apply tfplan
```
*(Alternatively, run `terraform apply` and type `yes` when prompted).*

### Step 7: View Infrastructure Outputs (`output`)
Retrieve the public IP, public DNS, and application endpoint:
```bash
terraform output
```
Example output:
```text
application_url    = "http://54.210.12.34:3000"
instance_id        = "i-0a1b2c3d4e5f67890"
public_dns         = "ec2-54-210-12-34.compute-1.amazonaws.com"
public_ip          = "54.210.12.34"
security_group_id  = "sg-0123456789abcdef0"
vpc_id             = "vpc-0987654321fedcba0"
```

---

## 4. Bootstrapping Verification (EC2 User Data)

When the EC2 instance boots up for the first time, `user_data.sh` automatically:
1. Updates APT repositories.
2. Installs Docker CE, CLI, and Docker Compose plugin.
3. Starts and enables the Docker daemon.
4. Adds the default `ubuntu` user to the `docker` group.
5. Prepares the `/home/ubuntu/app` directory.

To check the bootstrap progress on the instance:
```bash
ssh -i /path/to/key.pem ubuntu@<EC2-PUBLIC-IP>
cat /var/log/user-data-bootstrap.log
docker --version
```

---

## 5. Teardown & Resource Cleanup (`destroy`)

To completely decommission the AWS resources and avoid unnecessary charges:
```bash
terraform destroy -auto-approve
```
Terraform will destroy resources in reverse topological dependency order:
1. Terminate EC2 instance.
2. Remove Security Group rules and Security Group.
3. Remove Subnet route table association and Route Table.
4. Detach and delete Internet Gateway.
5. Delete Subnet and custom VPC.

---

## 6. Terraform State Management Best Practices

1. **State Isolation**: `terraform.tfstate` contains full infrastructure state and potential metadata. It is explicitly excluded in `.gitignore`.
2. **Locking**: The `.terraform.lock.hcl` file guarantees deterministic provider binary checksums and must be committed to version control.
3. **Production S3 Remote Backend**:
   For multi-user teams, configure state storage in Amazon S3 with DynamoDB distributed locking:
   ```hcl
   # terraform {
   #   backend "s3" {
   #     bucket         = "devops-cicd-tf-state"
   #     key            = "production/terraform.tfstate"
   #     region         = "eu-west-1"
   #     dynamodb_table = "terraform-locks"
   #     encrypt        = true
   #   }
   # }
   ```

