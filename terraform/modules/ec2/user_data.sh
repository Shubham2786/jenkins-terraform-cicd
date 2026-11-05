#!/bin/bash
set -e

# ==============================================================================
# EC2 Bootstrap User Data Script
# Installs Docker, Docker Compose, Git, and configures the deployment environment
# ==============================================================================

echo "=== Starting EC2 Instance Initialization ==="

# 1. Update system packages
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y

# 2. Install essential utilities
apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    net-tools

# 3. Setup Docker official repository and install Docker Engine
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 4. Enable and start Docker service
systemctl enable docker
systemctl start docker

# 5. Grant Docker permissions to default ubuntu user
usermod -aG docker ubuntu

# 6. Prepare deployment workspace
mkdir -p /home/ubuntu/app
chown -R ubuntu:ubuntu /home/ubuntu/app

# 7. Verification log
docker --version >> /var/log/user-data-bootstrap.log
docker compose version >> /var/log/user-data-bootstrap.log
echo "=== EC2 Instance Initialization Completed Successfully ===" >> /var/log/user-data-bootstrap.log

