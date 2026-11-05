# Academic Assignment Submission: Screenshot Checklist

This document details the **18 mandatory screenshots** required for assignment submission, their exact purpose, recommended filename in the `screenshots/` directory, and instructions for capturing them during execution.

---

## Complete Screenshot Matrix

| # | Screenshot Name | Target Filename | What to Capture & Highlight |
|---|---|---|---|
| **01** | GitHub Repository Overview | `01_github_repository_overview.png` | GitHub repository root showing commits, branches, directory structure (`app`, `terraform`, `docs`, `Jenkinsfile`, `Dockerfile`). |
| **02** | Application Running Locally | `02_application_running_locally.png` | Browser window displaying the Next.js **DevOps CI/CD Automation Dashboard** at `http://localhost:3000` with status `Running`. |
| **03** | Jenkins Dashboard | `03_jenkins_dashboard.png` | Jenkins controller web UI showing the active pipeline project, weather icon, and last build status. |
| **04** | Jenkins Pipeline Configuration | `04_jenkins_pipeline_configuration.png` | Pipeline configuration page displaying GitHub SCM settings, Git repository URL, and script path (`Jenkinsfile`). |
| **05** | Jenkinsfile Inside Repository | `05_jenkinsfile_inside_repository.png` | GitHub web view or IDE editor showing the declarative `Jenkinsfile` at repository root with all 10 stages. |
| **06** | Jenkins Pipeline Execution | `06_jenkins_pipeline_successful_execution.png` | Jenkins Pipeline overview showing build #1 (or latest) in solid green status with total execution time. |
| **07** | Individual Pipeline Stages | `07_individual_pipeline_stages.png` | Jenkins Stage View showing all 10 stages: Checkout, Env Setup, Dependencies, Code Quality, Tests, Build, Docker Build, Docker Validate, Deployment, Post-Deploy. |
| **08** | Automated Test Results | `08_automated_test_results.png` | Jenkins test result trend page or CLI terminal output showing `PASS tests/api.test.ts` and `PASS tests/page.test.tsx` (6 tests passing). |
| **09** | Docker Image Creation | `09_docker_image_creation.png` | Terminal output showing `docker build` completion and `docker images` listing `devops-cicd-dashboard` with commit tag and latest tag. |
| **10** | Running Docker Container | `10_running_docker_container.png` | Terminal showing `docker ps` with container `devops-cicd-dashboard-app` running, port mapping `3000->3000`, and health status `healthy`. |
| **11** | Terraform Configuration Files | `11_terraform_configuration_files.png` | Project tree showing `terraform/` root files (`main.tf`, `provider.tf`, `versions.tf`) and child modules (`networking`, `security-group`, `ec2`). |
| **12** | Terraform Init Output | `12_terraform_init_output.png` | Terminal showing `terraform init` successfully initializing child modules and installing `hashicorp/aws` provider. |
| **13** | Terraform Validate Output | `13_terraform_validate_output.png` | Terminal showing `terraform validate` returning `Success! The configuration is valid.` |
| **14** | Terraform Plan Output | `14_terraform_plan_output.png` | Terminal displaying `terraform plan` execution previewing the VPC, Subnet, Route Table, IGW, Security Group, and EC2 instance. |
| **15** | Terraform Apply Output | `15_terraform_apply_output.png` | Terminal showing `terraform apply` completion, `Apply complete! Resources: 7 added`, and infrastructure outputs (`public_ip`, `application_url`). |
| **16** | AWS EC2 Instance Dashboard | `16_aws_ec2_instance_dashboard.png` | AWS Management Console showing the provisioned EC2 instance in `running` state with assigned Public IPv4 address. |
| **17** | Application Running on EC2 | `17_application_running_on_ec2.png` | Browser displaying `http://<EC2-PUBLIC-IP>` with the live **DevOps CI/CD Automation Dashboard** hosted on AWS. |
| **18** | Final Successful Deployment | `18_final_successful_deployment.png` | Terminal or browser showing `curl http://<EC2-PUBLIC-IP>/api/health` returning HTTP 200 with `{"status":"healthy","application":"devops-cicd-dashboard"}` alongside green Jenkins build. |

---

## Best Practices for Screenshot Capture

1. **High Resolution**: Capture full browser/terminal windows without cropping essential headers, URLs, or timestamps.
2. **Clear Typography**: Ensure terminal text is legible with a readable font size.
3. **No Credential Exposure**: Verify that no AWS secret keys, private SSH key content, or sensitive tokens are visible in terminal windows or screenshots.
4. **Consistency**: Ensure the commit ID visible in GitHub matches the commit hash shown in Jenkins Stage 1 and Docker image tags.

