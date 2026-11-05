# End-to-End DevOps CI/CD and Infrastructure Deployment Guide

This document outlines the complete operational procedure for deploying the **DevOps CI/CD Automation Dashboard** using **Terraform Modular Infrastructure as Code**, **GitHub**, **Jenkins CI/CD**, and **Docker on AWS EC2**.

---

## 1. High-Level Delivery Flow

```text
[Developer Workstation]
        │
        ▼
   (git push)
        │
        ▼
[GitHub Repository] ──────── (Webhook Notification) ────────┐
                                                            ▼
                                                    [Jenkins Controller]
                                                            │
                                                            ├─ 1. Checkout
                                                            ├─ 2. Env Setup
                                                            ├─ 3. Install (npm ci)
                                                            ├─ 4. Lint & Typecheck
                                                            ├─ 5. Test (Jest + JUnit)
                                                            ├─ 6. Next.js Build
                                                            ├─ 7. Docker Build
                                                            ├─ 8. Local Container Validation
                                                            │
[Modular Terraform]                                         │
        │                                                   │
  (terraform apply)                                         │
        │                                                   │
        ▼                                                   │
[AWS Cloud Infrastructure]                                  │
  ├─ Custom VPC (10.0.0.0/16)                               │
  ├─ Internet Gateway & Route Tables                        │
  ├─ Public Subnet (10.0.1.0/24)                            │
  ├─ Security Group (22, 80, 3000)                          │
  └─ EC2 Docker Host (Ubuntu 22.04) ◄─── (SSH Deploy) ──────┘
        │
        ▼
[Live Containerized Dashboard: Port 80 / 3000]
        │
        ▼
[Post-Deployment Verification: GET /api/health]
```

---

## 2. Phase 1: Local Development & Validation

Verify all components locally before initiating cloud deployment:

```bash
# 1. Install dependencies
npm ci

# 2. Run TypeScript strict check and ESLint
npm run type-check
npm run lint

# 3. Execute unit and API health tests
npm test

# 4. Verify Next.js production compilation
npm run build

# 5. Test local container execution with Docker Compose
docker compose up -d

# 6. Verify health endpoint locally
curl http://localhost:3000/api/health
# Expected: {"status":"healthy","application":"devops-cicd-dashboard",...}

# 7. Stop local container
docker compose down
```

---

## 3. Phase 2: Push Source Code to GitHub

Initialize git, commit all project files, and push to your remote GitHub repository:

```bash
# 1. Initialize repository (if not already done)
git init

# 2. Add all project files
git add .

# 3. Commit changes
git commit -m "feat: complete Next.js dashboard, Jenkinsfile, and modular Terraform IaC"

# 4. Link remote GitHub repository
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git branch -M main

# 5. Push to GitHub
git push -u origin main
```

---

## 4. Phase 3: Infrastructure Provisioning via Terraform

Provision the AWS EC2 instance, custom VPC, and security group:

```bash
cd terraform

# 1. Initialize Terraform
terraform init

# 2. Format and validate
terraform fmt -recursive
terraform validate

# 3. Configure terraform.tfvars
cp terraform.tfvars.example terraform.tfvars
# Update key_name with your AWS Key Pair name:
# key_name = "my-aws-key"

# 4. Plan and review resources
terraform plan -out=tfplan

# 5. Apply infrastructure (Requires User Confirmation)
terraform apply tfplan

# 6. Extract EC2 Public IP and URLs
terraform output
```

Record the following outputs:
- `public_ip`: (e.g. `54.210.12.34`)
- `application_url`: `http://54.210.12.34:3000`

---

## 5. Phase 4: Configure Jenkins CI/CD Pipeline

Follow [JENKINS_SETUP.md](./JENKINS_SETUP.md) to complete controller configuration:

1. **Add EC2 SSH Credential**:
   - Go to **Manage Jenkins** &rarr; **Credentials** &rarr; **System** &rarr; **Global credentials**.
   - Add **SSH Username with private key**:
     - ID: `ec2-ssh-key`
     - Username: `ubuntu`
     - Private Key: Paste your `.pem` key content.
2. **Create Pipeline Job**:
   - Name: `DevOps-CICD-Dashboard`
   - Definition: **Pipeline script from SCM**
   - SCM: **Git**
   - Repository URL: `https://github.com/<your-username>/<your-repo-name>.git`
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`
3. **Configure GitHub Webhook**:
   - Under your GitHub repo **Settings** &rarr; **Webhooks**, add `http://<jenkins-ip>:8080/github-webhook/`.

---

## 6. Phase 5: Pipeline Execution & Deployment

### Triggering the Pipeline:

1. Go to your Jenkins job and click **Build with Parameters**.
2. Configure parameters:
   - `ENVIRONMENT`: `production`
   - `RUN_TERRAFORM_VALIDATION`: `true`
   - `DEPLOY_TO_EC2`: `true`
   - `EC2_HOST`: `<EC2-PUBLIC-IP>` (e.g., `54.210.12.34`)
   - `EC2_USER`: `ubuntu`
   - `SSH_CREDENTIAL_ID`: `ec2-ssh-key`
3. Click **Build**.

### Pipeline Stages Progression:
1. **Checkout**: Retrieves source code and commit hash.
2. **Terraform IaC Validation**: Verifies modular Terraform code syntax.
3. **Environment Setup**: Inspects Node.js, npm, and Docker runtimes.
4. **Install Dependencies**: Executes deterministic `npm ci`.
5. **Code Quality**: Runs ESLint and strict TypeScript type-checking.
6. **Automated Testing**: Executes Jest suites and archives `junit.xml`.
7. **Production Build**: Compiles Next.js standalone distribution.
8. **Docker Build**: Packages application into multi-stage Alpine image.
9. **Docker Validation**: Runs ephemeral container locally and verifies `/api/health`.
10. **Deployment**: Securely transfers image to EC2 via SSH, starts container on port 80/3000.
11. **Post-Deployment Verification**: Performs live HTTP health check against EC2 public IP.

---

## 7. Phase 6: Live Health Check & Verification

Once the pipeline completes successfully:

1. Open your web browser and visit:
   ```text
   http://<EC2-PUBLIC-IP>
   ```
   You will see the **DevOps CI/CD Automation Dashboard** with status `Running`, build details, and pipeline stages.

2. Test the health endpoint:
   ```bash
   curl -i http://<EC2-PUBLIC-IP>/api/health
   ```
   Expected HTTP Response:
   ```json
   HTTP/1.1 200 OK
   Content-Type: application/json; charset=utf-8
   Cache-Control: no-store, max-age=0

   {
     "status": "healthy",
     "application": "devops-cicd-dashboard",
     "timestamp": "2026-11-05T10:15:00.000Z",
     "uptime": 128.45
   }
   ```

---

## 8. Phase 7: Infrastructure Decommissioning (Cleanup)

After completing the demonstration, prevent AWS billing charges by destroying all provisioned infrastructure:

```bash
cd terraform
terraform destroy -auto-approve
```

All AWS resources (EC2 instance, security group, route tables, internet gateway, and custom VPC) are systematically decommissioned.

