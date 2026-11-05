# Jenkins CI/CD Setup and Configuration Guide

This guide provides complete, production-grade instructions to set up, configure, and operate the automated Jenkins CI/CD pipeline for the **DevOps CI/CD Automation Dashboard** project.

---

## 1. System Requirements & Architecture

- **Host OS**: Ubuntu 22.04 LTS, Debian 12, or Windows/macOS with Docker Desktop
- **Memory**: Minimum 4 GB RAM (8 GB recommended)
- **Disk Space**: Minimum 20 GB free space
- **Runtime Dependencies**: Java 17/21 (OpenJDK), Docker Engine, Git, Node.js 20+

---

## 2. Jenkins Installation

### Option A: Direct Installation on Ubuntu 22.04 LTS (Recommended)

```bash
# 1. Update system packages
sudo apt-get update -y
sudo apt-get install -y openjdk-17-jdk git curl

# 2. Add Jenkins official repository key and list
sudo wget -O /usr/share/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key

echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/" | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# 3. Install Jenkins
sudo apt-get update -y
sudo apt-get install -y jenkins

# 4. Start and enable Jenkins service
sudo systemctl daemon-reload
sudo systemctl enable jenkins
sudo systemctl start jenkins

# 5. Retrieve Initial Admin Password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### Option B: Docker-in-Docker Jenkins Container

```bash
docker run -d \
  --name jenkins-server \
  --restart unless-stopped \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -u root \
  jenkins/jenkins:lts
```

Open your browser at `http://<jenkins-host>:8080` and unlock Jenkins using the initial admin password.

---

## 3. Required Jenkins Plugins

Navigate to **Manage Jenkins** &rarr; **Plugins** &rarr; **Available Plugins** and install:

| Plugin Name | Purpose |
|---|---|
| **Pipeline** | Core declarative and scripted pipeline engine |
| **Git Plugin** | SCM source checkout and branch polling |
| **GitHub Integration** | Webhook triggers and commit status updates |
| **NodeJS Plugin** | Automatic Node.js tool installation and PATH configuration |
| **Docker Pipeline** | Native Docker build, run, and management steps |
| **Credentials Binding** | Secure masking and injection of SSH keys and tokens |
| **SSH Agent Plugin** | SSH key agent for remote deployment without hardcoded keys |
| **JUnit Plugin** | XML test result parsing and trend reporting |
| **AnsiColor** | Colorized console log rendering |
| **Timestamper** | Real-time timestamps in pipeline console logs |

Restart Jenkins after installing the plugins:
```bash
sudo systemctl restart jenkins
```

---

## 4. Docker & System Permissions Configuration

By default, the `jenkins` system user does NOT have permission to access the Docker daemon socket (`/var/run/docker.sock`). You must grant access:

```bash
# 1. Add jenkins user to the docker group
sudo usermod -aG docker jenkins

# 2. Verify permissions
sudo -u jenkins docker --version
sudo -u jenkins docker ps

# 3. Restart Jenkins daemon to refresh group membership
sudo systemctl restart jenkins
```

> **IMPORTANT**: Failure to add `jenkins` to the `docker` group will result in `permission denied while trying to connect to the Docker daemon socket` during Stage 7 and 8.

---

## 5. Tool Configuration (Node.js & Terraform)

1. Go to **Manage Jenkins** &rarr; **Tools**.
2. **NodeJS**:
   - Click **Add NodeJS**.
   - Name: `NodeJS-20`.
   - Select **Install automatically** &rarr; Version: `NodeJS 20.x`.
3. **Terraform** (if using Terraform CLI on the controller):
   - Click **Add Terraform** (or install binary directly on host at `/usr/local/bin/terraform`).
   - Ensure `terraform -version` returns `v1.5+`.

---

## 6. Configuring Jenkins Credentials

Navigate to **Manage Jenkins** &rarr; **Credentials** &rarr; **System** &rarr; **Global credentials** &rarr; **Add Credentials**.

### Credential 1: EC2 SSH Private Key
- **Kind**: `SSH Username with private key`
- **ID**: `ec2-ssh-key` (Must match `SSH_CREDENTIAL_ID` in `Jenkinsfile`)
- **Description**: `AWS EC2 SSH Key Pair for automated container deployment`
- **Username**: `ubuntu`
- **Private Key**: Select **Enter directly** and paste your `.pem` private key content.

### Credential 2: GitHub Personal Access Token (Optional for Private Repos)
- **Kind**: `Username with password` or `Secret text`
- **ID**: `github-pat`
- **Secret**: GitHub Personal Access Token (classic) with `repo` and `admin:repo_hook` scopes.

---

## 7. Pipeline Job Creation

1. In the Jenkins Dashboard, click **New Item**.
2. Enter Item Name: `DevOps-CICD-Dashboard-Pipeline`.
3. Select **Pipeline** and click **OK**.
4. In the Job Configuration page:
   - **General**: Check **GitHub project** and enter your repository URL:
     `https://github.com/<username>/<repository-name>/`
   - **Build Triggers**: Check **GitHub hook trigger for GITScm polling**.
   - **Pipeline Definition**: Select **Pipeline script from SCM**.
   - **SCM**: Select **Git**.
   - **Repository URL**: `https://github.com/<username>/<repository-name>.git`
   - **Credentials**: Select your GitHub credential if private, or leave blank for public.
   - **Branches to build**: `*/main` (or `*/master`).
   - **Script Path**: `Jenkinsfile` (located at repository root).
   - Uncheck **Lightweight checkout** if you need full `.git` metadata for commit hashing.
5. Click **Save**.

---

## 8. GitHub Webhook Setup (Automated Triggering)

To trigger the pipeline automatically upon every `git push`:

1. Open your repository on GitHub.
2. Go to **Settings** &rarr; **Webhooks** &rarr; **Add webhook**.
3. **Payload URL**: `http://<jenkins-public-ip>:8080/github-webhook/`
   *(Ensure trailing slash is present)*.
4. **Content type**: `application/json`.
5. **Which events would you like to trigger this webhook?**:
   - Select **Just the push event**.
6. Check **Active** and click **Add webhook**.
7. GitHub will send a test ping with a green checkmark indicating successful connection.

---

## 9. Executing the Pipeline

### Mode 1: Automated CI/CD (GitHub Push)
Every time a developer pushes code to `main`:
```bash
git add .
git commit -m "feat: enhance dashboard metrics"
git push origin main
```
Jenkins receives the webhook event and triggers the 10-stage pipeline automatically.

### Mode 2: Manual Pipeline Execution with Parameters
1. Open the pipeline job in Jenkins.
2. Click **Build with Parameters**.
3. Provide parameter values:
   - `ENVIRONMENT`: `production`
   - `RUN_TERRAFORM_VALIDATION`: `true`
   - `DEPLOY_TO_EC2`: `true` (Enable when AWS EC2 instance is active)
   - `EC2_HOST`: `<ec2-public-ip>` (Copied from `terraform output public_ip`)
   - `EC2_USER`: `ubuntu`
   - `SSH_CREDENTIAL_ID`: `ec2-ssh-key`
4. Click **Build**.
5. Monitor real-time stage progression in the **Stage View** or **Console Output**.

---

## 10. Troubleshooting Common Issues

### Issue 1: `docker: permission denied while trying to connect to the Docker daemon socket`
- **Cause**: Jenkins user lacks membership in the `docker` system group.
- **Resolution**:
  ```bash
  sudo usermod -aG docker jenkins
  sudo systemctl restart jenkins
  ```

### Issue 2: `npm ci: package-lock.json is missing or out of sync`
- **Cause**: `package.json` was updated without regenerating `package-lock.json`.
- **Resolution**:
  ```bash
  npm install
  git add package.json package-lock.json
  git commit -m "fix: synchronize package-lock.json"
  git push
  ```

### Issue 3: `Host key verification failed` during SSH deployment
- **Cause**: The EC2 host key is not in `known_hosts`.
- **Resolution**: The pipeline uses `-o StrictHostKeyChecking=no` to automate host key acceptance safely on dynamically provisioned cloud instances. Ensure this flag is present in your SSH/SCP invocations.

### Issue 4: `Connection refused on port 80 / 3000`
- **Cause**: AWS EC2 Security Group inbound rule does not permit port 80 or 3000, or user data script is still installing Docker.
- **Resolution**:
  - Wait 2–3 minutes after initial EC2 launch for `user_data.sh` to finish installing Docker.
  - Verify security group rules in Terraform (`modules/security-group/main.tf`).

