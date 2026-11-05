# Academic Demonstration Script (5–7 Minutes)

**Project Title:** DevOps CI/CD Automation Dashboard with Jenkins & Modular Terraform Infrastructure as Code  
**Presenter:** DevOps Engineer / Cloud Architect  
**Duration:** 5 to 7 Minutes  

---

## Presentation Overview & Timing Breakdown

| Section | Topic | Allocated Time |
|---|---|---|
| **01** | Introduction & Problem Statement | 0:00 – 0:45 |
| **02** | Application Overview & Local Execution | 0:45 – 1:30 |
| **03** | Repository Structure & Architecture Overview | 1:30 – 2:15 |
| **04** | Modular Terraform IaC Deep Dive | 2:15 – 3:30 |
| **05** | Jenkins Declarative CI/CD Pipeline (10 Stages) | 3:30 – 4:45 |
| **06** | Live Container & Deployment Health Verification | 4:45 – 5:45 |
| **07** | Conclusion, Security Best Practices & Teardown | 5:45 – 6:30 |

---

## 1. Introduction & Problem Statement (0:00 – 0:45)

### Spoken Script:
> "Good day, professors and evaluators. Today, I am presenting a complete, enterprise-grade DevOps implementation demonstrating **Automated Continuous Integration and Continuous Deployment using Jenkins**, alongside **Infrastructure as Code using modular Terraform on Amazon Web Services**.
>
> In real-world software delivery, manual server configuration leads to configuration drift, deployment inconsistencies, and downtime. Our objective today is **not** to build a needlessly complex application, but rather to prove how a modern, production-ready DevOps pipeline reliably builds, tests, containerizes, and deploys a lightweight Next.js application onto dynamically provisioned AWS infrastructure with zero manual intervention."

---

## 2. Application Overview & Local Execution (0:45 – 1:30)

### Spoken Script:
> "Let's first inspect the application. We selected **Next.js 14 with App Router and TypeScript**. The application is called **DevOps CI/CD Automation Dashboard**. It provides an operational overview displaying runtime health, build identifiers, CI/CD pipeline states, and hosting metadata."

### Live Demonstration Action:
Run the unit test suite and local application:
```bash
# Execute automated test suites with JUnit report generation
npm test
```

### Spoken Script:
> "**Why this matters:** Notice that running `npm test` executes both component render tests and REST API contract tests using Jest, simultaneously outputting a standardized `junit.xml` report. Next, let's verify the production health endpoint:"

```bash
# Start the production build locally or query the health check
curl http://localhost:3000/api/health
```
> "**Why this matters:** The `/api/health` endpoint responds with HTTP 200 and strict JSON payload `{"status":"healthy","application":"devops-cicd-dashboard"}`. This lightweight endpoint acts as our unambiguous health verification gate during container smoke tests and post-deployment monitoring."

---

## 3. GitHub Repository Structure (1:30 – 2:15)

### Spoken Script:
> "Examining our repository layout, everything follows standard DevOps separation of concerns:"

```text
devops-cicd-terraform/
├── app/               # Next.js App Router frontend and /api/health endpoint
├── tests/             # Automated Jest unit and integration tests
├── terraform/         # Root module and reusable child modules
│   ├── modules/networking/
│   ├── modules/security-group/
│   └── modules/ec2/
├── docs/              # Comprehensive setup guides, runbooks, and scripts
├── Jenkinsfile        # 10-stage declarative CI/CD pipeline
├── Dockerfile         # Multi-stage production container manifest
└── docker-compose.yml # Local development container orchestration
```

> "**Why this matters:** The root contains our single source of truth: the `Jenkinsfile` and `Dockerfile`. Infrastructure code is isolated in `terraform/`, while documentation and screenshot checklists ensure academic auditability."

---

## 4. Modular Terraform Infrastructure as Code (2:15 – 3:30)

### Spoken Script:
> "Now let us turn to one of the most critical elements: **Terraform Infrastructure as Code**.
>
> Rather than placing all AWS resources into a single monolithic script, we strictly engineered a **Root Module + Reusable Child Modules** architecture consisting of three specialized modules:
>
> 1. **Networking Module:** Creates a dedicated VPC (`10.0.0.0/16`), an Internet Gateway, and a public subnet (`10.0.1.0/24`) with automatic public IP assignment.
> 2. **Security Group Module:** Implements the principle of least privilege, opening SSH (port 22) restricted to a trusted CIDR, alongside ports 80 and 3000 for web traffic.
> 3. **EC2 Compute Module:** Dynamically queries the latest official Ubuntu 22.04 LTS AMI from Canonical using an AWS data source, provisions the EC2 instance, and executes an automated `user_data.sh` script to bootstrap the Docker runtime."

### Live Demonstration Action:
Execute Terraform formatting and validation:
```bash
cd terraform
terraform fmt -recursive
terraform validate
```

### Spoken Script:
> "**Why this matters:** `terraform validate` confirms that module interfaces, input variables, and resource dependencies form a clean, acyclic dependency graph without circular references.
>
> When `terraform apply` is executed, the root module passes the VPC ID from the networking module into the security group module, and passes the subnet and security group IDs into the EC2 module. This avoids hardcoded IDs and ensures repeatable infrastructure provisioning."

---

## 5. Jenkins Declarative CI/CD Pipeline (3:30 – 4:45)

### Spoken Script:
> "Next, let's examine our **Declarative Jenkins Pipeline** defined in the `Jenkinsfile`.
>
> Our pipeline implements **10 distinct stages**, each with a strictly defined operational goal:"

1. **Stage 1 (Checkout):** Clones the Git repository and logs the commit hash and branch.
2. **Stage 2 (Environment Setup):** Verifies Node.js, npm, and Docker versions.
3. **Stage 3 (Install Dependencies):** Executes `npm ci` using `package-lock.json` for deterministic builds.
4. **Stage 4 (Code Quality):** Enforces ESLint and TypeScript strict type-checking (`tsc --noEmit`).
5. **Stage 5 (Automated Testing):** Runs automated tests and archives `junit.xml` via Jenkins JUnit plugin.
6. **Stage 6 (Production Build):** Executes `npm run build` and verifies the `.next` standalone bundle.
7. **Stage 7 (Docker Build):** Packages the application using our multi-stage Dockerfile, tagging with both build number and commit hash.
8. **Stage 8 (Docker Validation):** Starts a temporary local container on port 3001, performs an HTTP curl against `/api/health`, and tears down the test container.
9. **Stage 9 (Deployment to AWS EC2):** Binds SSH credentials securely, transfers the Docker container to the EC2 host via SCP/SSH, and restarts the container on port 80.
10. **Stage 10 (Post-Deployment Verification):** Queries the remote EC2 instance's `/api/health` endpoint, failing the build if the application does not return HTTP 200.

> "**Why this matters:** We avoid monolithic shell scripts. Every operation is an observable, measurable Jenkins stage with automated cleanup in post-actions and zero exposed credentials."

---

## 6. Docker Container Optimization & Live Health Verification (4:45 – 5:45)

### Spoken Script:
> "Let's review our **Dockerfile**.
>
> We use a **3-stage multi-stage build**:
> - Stage 1 (`deps`): Installs production and build dependencies.
> - Stage 2 (`builder`): Compiles Next.js standalone output.
> - Stage 3 (`runner`): Uses a minimal `node:20-alpine` base image, runs under a dedicated unprivileged user `nextjs` (UID 1001), and copies only the standalone traces.

### Live Demonstration Action:
Show the running container and query its health:
```bash
# Query the live container health
curl -s http://localhost:3000/api/health | jq .
```

### Spoken Script:
> "**Why this matters:** Running containers as non-root mitigates container escape vulnerabilities. Using Next.js standalone output cuts image size by over 80% compared to shipping full `node_modules`."

---

## 7. Conclusion & Teardown (5:45 – 6:30)

### Spoken Script:
> "To summarize what we have demonstrated today:
>
> 1. **Modular Infrastructure as Code:** Fully automated AWS provisioning using Terraform Root and Child modules.
> 2. **Complete Jenkins CI/CD:** A 10-stage declarative pipeline validating code quality, testing with JUnit reporting, building Docker containers, and executing automated smoke tests.
> 3. **Production Cloud Deployment:** Automated deployment to AWS EC2 using secure SSH credential binding and zero hardcoded secrets.
> 4. **Infrastructure Cleanup:** When we are ready to decommission, a single command—`terraform destroy -auto-approve`—cleanly tears down all cloud resources, ensuring no lingering AWS costs.
>
> Thank you for your time and attention. I am now ready to answer any questions."

