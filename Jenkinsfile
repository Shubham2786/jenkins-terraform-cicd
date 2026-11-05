// ==============================================================================
// Jenkins Declarative CI/CD Pipeline
// Project: DevOps CI/CD Automation Dashboard
// Target Infrastructure: AWS EC2 (Provisioned via Modular Terraform)
// ==============================================================================

pipeline {
    agent any

    options {
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        ansiColor('xterm')
    }

    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['production', 'staging', 'development'],
            description: 'Target deployment environment'
        )
        booleanParam(
            name: 'RUN_TERRAFORM_VALIDATION',
            defaultValue: true,
            description: 'Execute Terraform syntax, formatting, and validation checks'
        )
        booleanParam(
            name: 'DEPLOY_TO_EC2',
            defaultValue: false,
            description: 'Deploy application to AWS EC2 instance (requires active EC2 instance & SSH credentials)'
        )
        string(
            name: 'EC2_HOST',
            defaultValue: '',
            description: 'Public IP or Public DNS of the provisioned AWS EC2 instance (from terraform output)'
        )
        string(
            name: 'EC2_USER',
            defaultValue: 'ubuntu',
            description: 'Default SSH user for AWS Ubuntu EC2 instance'
        )
        string(
            name: 'SSH_CREDENTIAL_ID',
            defaultValue: 'ec2-ssh-key',
            description: 'Jenkins SSH Private Key Credential ID configured in Credentials Manager'
        )
        string(
            name: 'APP_PORT',
            defaultValue: '3000',
            description: 'Application container port'
        )
    }

    environment {
        APP_NAME         = 'devops-cicd-dashboard'
        IMAGE_NAME       = 'devops-cicd-dashboard'
        CONTAINER_NAME   = 'devops-cicd-dashboard-app'
        TEST_CONTAINER   = 'devops-dashboard-test'
        TEST_PORT        = '3001'
        DOCKER_REGISTRY  = 'local'
        GIT_COMMIT_SHORT = ''
    }

    stages {
        // ----------------------------------------------------------------------
        // STAGE 1: Checkout Source Code
        // ----------------------------------------------------------------------
        stage('Checkout') {
            steps {
                echo '=== [Stage 1/10] Checking out source code from GitHub ==='
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()
                    def gitBranch = env.BRANCH_NAME ?: env.GIT_BRANCH ?: 'main'
                    echo "Repository: ${env.GIT_URL ?: 'GitHub Source'}"
                    echo "Branch: ${gitBranch}"
                    echo "Commit ID: ${env.GIT_COMMIT_SHORT}"
                }
            }
        }

        // ----------------------------------------------------------------------
        // OPTIONAL STAGE: Terraform IaC Validation
        // ----------------------------------------------------------------------
        stage('Terraform IaC Validation') {
            when {
                expression { params.RUN_TERRAFORM_VALIDATION == true }
            }
            steps {
                echo '=== Validating Terraform Modular Infrastructure as Code ==='
                sh '''
                    echo "Checking Terraform CLI installation..."
                    terraform -version

                    echo "Validating Terraform code formatting..."
                    terraform -chdir=terraform fmt -check -recursive

                    echo "Initializing Terraform root and child modules (backend-less validation)..."
                    terraform -chdir=terraform init -backend=false

                    echo "Validating Terraform configuration syntax and module references..."
                    terraform -chdir=terraform validate
                '''
            }
        }

        // ----------------------------------------------------------------------
        // STAGE 2: Environment Setup
        // ----------------------------------------------------------------------
        stage('Environment Setup') {
            steps {
                echo '=== [Stage 2/10] Validating runtime tools & system environment ==='
                sh '''
                    echo "Operating System: $(uname -s 2>/dev/null || echo Windows/Other)"
                    echo "Architecture: $(uname -m 2>/dev/null || echo Unknown)"
                    echo "Node.js Version: $(node -v)"
                    echo "NPM Version: $(npm -v)"
                    echo "Docker Version: $(docker --version)"
                    echo "Checking Docker Daemon connectivity..."
                    docker info > /dev/null 2>&1 || echo "Warning: Docker daemon verification completed."
                '''
            }
        }

        // ----------------------------------------------------------------------
        // STAGE 3: Install Dependencies
        // ----------------------------------------------------------------------
        stage('Install Dependencies') {
            steps {
                echo '=== [Stage 3/10] Installing production and dev dependencies ==='
                sh '''
                    if [ ! -f "package-lock.json" ]; then
                        echo "ERROR: package-lock.json is missing! npm ci requires package-lock.json."
                        exit 1
                    fi
                    echo "Executing clean dependency install via npm ci..."
                    npm ci --prefer-offline --no-audit
                '''
            }
        }

        // ----------------------------------------------------------------------
        // STAGE 4: Code Quality and Validation
        // ----------------------------------------------------------------------
        stage('Code Quality and Validation') {
            steps {
                echo '=== [Stage 4/10] Executing ESLint and TypeScript type checking ==='
                sh '''
                    echo "Running ESLint static code analysis..."
                    npm run lint

                    echo "Running TypeScript strict type checking..."
                    npm run type-check
                '''
            }
        }

        // ----------------------------------------------------------------------
        // STAGE 5: Automated Testing
        // ----------------------------------------------------------------------
        stage('Automated Testing') {
            steps {
                echo '=== [Stage 5/10] Executing automated unit & integration test suites ==='
                sh '''
                    echo "Running Jest tests with JUnit XML reporter output..."
                    npm test
                '''
            }
            post {
                always {
                    echo 'Publishing JUnit test results...'
                    junit allowEmptyResults: true, testResults: 'junit.xml'
                }
            }
        }

        // ----------------------------------------------------------------------
        // STAGE 6: Production Build
        // ----------------------------------------------------------------------
        stage('Production Build') {
            steps {
                echo '=== [Stage 6/10] Compiling Next.js Standalone Production Build ==='
                sh '''
                    echo "Building Next.js application..."
                    npm run build

                    echo "Verifying build artifact presence..."
                    if [ ! -d ".next" ]; then
                        echo "ERROR: .next compilation directory was not generated!"
                        exit 1
                    fi
                    echo "Next.js production build succeeded."
                '''
            }
        }

        // ----------------------------------------------------------------------
        // STAGE 7: Docker Build
        // ----------------------------------------------------------------------
        stage('Docker Build') {
            steps {
                echo '=== [Stage 7/10] Building optimized Multi-Stage Docker Image ==='
                script {
                    def imageTag = "${env.IMAGE_NAME}:${env.BUILD_NUMBER}-${env.GIT_COMMIT_SHORT}"
                    def latestTag = "${env.IMAGE_NAME}:latest"
                    echo "Building Docker image with tags: ${imageTag} and ${latestTag}"
                    sh """
                        docker build \
                            -t ${imageTag} \
                            -t ${latestTag} \
                            .
                    """
                }
            }
        }

        // ----------------------------------------------------------------------
        // STAGE 8: Docker Validation
        // ----------------------------------------------------------------------
        stage('Docker Validation') {
            steps {
                echo '=== [Stage 8/10] Validating local Docker container & health endpoint ==='
                sh """
                    echo "Verifying Docker image presence..."
                    docker images | grep ${env.IMAGE_NAME} || true

                    echo "Cleaning up any existing test container on port ${env.TEST_PORT}..."
                    docker stop ${env.TEST_CONTAINER} > /dev/null 2>&1 || true
                    docker rm ${env.TEST_CONTAINER} > /dev/null 2>&1 || true

                    echo "Starting container in background on port ${env.TEST_PORT}..."
                    docker run -d \
                        --name ${env.TEST_CONTAINER} \
                        -p ${env.TEST_PORT}:3000 \
                        -e NODE_ENV=production \
                        ${env.IMAGE_NAME}:latest

                    echo "Waiting 5 seconds for Next.js server initialization..."
                    sleep 5

                    echo "Checking health endpoint (http://localhost:${env.TEST_PORT}/api/health)..."
                    HEALTH_RESPONSE=\$(curl -s -f http://localhost:${env.TEST_PORT}/api/health || echo "FAILED")
                    echo "Health response: \${HEALTH_RESPONSE}"

                    if echo "\${HEALTH_RESPONSE}" | grep -q '"status":"healthy"'; then
                        echo "SUCCESS: Docker container health verification passed!"
                    else
                        echo "ERROR: Health check failed or returned invalid response."
                        docker logs ${env.TEST_CONTAINER}
                        docker stop ${env.TEST_CONTAINER} || true
                        docker rm ${env.TEST_CONTAINER} || true
                        exit 1
                    fi

                    echo "Cleaning up test container..."
                    docker stop ${env.TEST_CONTAINER}
                    docker rm ${env.TEST_CONTAINER}
                """
            }
        }

        // ----------------------------------------------------------------------
        // STAGE 9: Deployment to AWS EC2
        // ----------------------------------------------------------------------
        stage('Deployment') {
            when {
                expression { params.DEPLOY_TO_EC2 == true }
            }
            steps {
                echo '=== [Stage 9/10] Deploying application to AWS EC2 instance ==='
                script {
                    if (!params.EC2_HOST || params.EC2_HOST.trim() == '') {
                        error('Deployment aborted: EC2_HOST parameter is required when DEPLOY_TO_EC2 is enabled.')
                    }

                    echo "Target Host: ${params.EC2_HOST}"
                    echo "SSH User: ${params.EC2_USER}"
                    echo "Transferring and starting container on AWS EC2..."

                    // Securely bind SSH Private Key from Jenkins Credentials
                    withCredentials([sshUserPrivateKey(
                        credentialsId: params.SSH_CREDENTIAL_ID,
                        keyFileVariable: 'SSH_KEY',
                        usernameVariable: 'SSH_USER'
                    )]) {
                        sh """
                            # Set strict private key permissions
                            chmod 600 \${SSH_KEY}

                            echo "Exporting Docker image for remote transfer..."
                            docker save ${env.IMAGE_NAME}:latest | gzip > /tmp/${env.IMAGE_NAME}.tar.gz

                            echo "Copying Docker archive to EC2 instance..."
                            scp -o StrictHostKeyChecking=no -i \${SSH_KEY} /tmp/${env.IMAGE_NAME}.tar.gz \${SSH_USER}@${params.EC2_HOST}:/home/\${SSH_USER}/${env.IMAGE_NAME}.tar.gz

                            echo "Executing remote deployment on EC2..."
                            ssh -o StrictHostKeyChecking=no -i \${SSH_KEY} \${SSH_USER}@${params.EC2_HOST} << 'EOF'
                                set -e
                                echo "Loading Docker image..."
                                docker load < /home/ubuntu/${env.IMAGE_NAME}.tar.gz
                                rm -f /home/ubuntu/${env.IMAGE_NAME}.tar.gz

                                echo "Stopping and removing existing application container..."
                                docker stop ${env.CONTAINER_NAME} > /dev/null 2>&1 || true
                                docker rm ${env.CONTAINER_NAME} > /dev/null 2>&1 || true

                                echo "Starting updated application container on port 80..."
                                docker run -d \
                                    --name ${env.CONTAINER_NAME} \
                                    --restart unless-stopped \
                                    -p 80:3000 \
                                    -p 3000:3000 \
                                    -e NODE_ENV=production \
                                    -e NEXT_PUBLIC_APP_VERSION=v1.0.0 \
                                    -e NEXT_PUBLIC_ENV=${params.ENVIRONMENT} \
                                    -e NEXT_PUBLIC_BUILD_ID=${env.BUILD_NUMBER} \
                                    ${env.IMAGE_NAME}:latest

                                echo "Remote container successfully started."
                                docker ps -f name=${env.CONTAINER_NAME}
EOF
                            rm -f /tmp/${env.IMAGE_NAME}.tar.gz
                        """
                    }
                }
            }
        }

        // ----------------------------------------------------------------------
        // STAGE 10: Post-Deployment Verification
        // ----------------------------------------------------------------------
        stage('Post-Deployment Verification') {
            when {
                expression { params.DEPLOY_TO_EC2 == true }
            }
            steps {
                echo '=== [Stage 10/10] Performing live post-deployment health verification ==='
                sh """
                    echo "Waiting 10 seconds for remote service warming..."
                    sleep 10

                    echo "Querying EC2 application health endpoint: http://${params.EC2_HOST}/api/health..."
                    REMOTE_HEALTH=\$(curl -s -f --max-time 15 "http://${params.EC2_HOST}/api/health" || echo "FAILED")
                    echo "Remote health response: \${REMOTE_HEALTH}"

                    if echo "\${REMOTE_HEALTH}" | grep -q '"status":"healthy"'; then
                        echo "============================================================"
                        echo "SUCCESS: Application is LIVE and healthy on AWS EC2!"
                        echo "Deployed URL: http://${params.EC2_HOST}"
                        echo "Health URL:   http://${params.EC2_HOST}/api/health"
                        echo "============================================================"
                    else
                        echo "ERROR: Remote health verification failed on EC2!"
                        exit 1
                    fi
                """
            }
        }
    }

    // --------------------------------------------------------------------------
    // Post-Build Notifications and Resource Cleanup
    // --------------------------------------------------------------------------
    post {
        always {
            echo '=== Executing pipeline post-actions: Cleaning temporary resources ==='
            sh """
                docker stop ${env.TEST_CONTAINER} > /dev/null 2>&1 || true
                docker rm ${env.TEST_CONTAINER} > /dev/null 2>&1 || true
            """
        }
        success {
            echo "===================================================================="
            echo "PIPELINE COMPLETED SUCCESSFULLY!"
            echo "Build: #${BUILD_NUMBER} | Commit: ${env.GIT_COMMIT_SHORT}"
            echo "Environment: ${params.ENVIRONMENT}"
            script {
                if (params.DEPLOY_TO_EC2 == true && params.EC2_HOST != '') {
                    echo "Live URL: http://${params.EC2_HOST}"
                } else {
                    echo "CI validation and Docker artifact build verified."
                    echo "To deploy to AWS EC2, run pipeline with DEPLOY_TO_EC2=true and provide EC2_HOST."
                }
            }
            echo "===================================================================="
        }
        failure {
            echo "===================================================================="
            echo "PIPELINE FAILED: Please inspect console logs above for stage error details."
            echo "Build: #${BUILD_NUMBER} | Commit: ${env.GIT_COMMIT_SHORT}"
            echo "===================================================================="
        }
    }
}

