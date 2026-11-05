pipeline {
    agent any

    parameters {
        booleanParam(name: 'DEPLOY_TO_EC2', defaultValue: false, description: 'Deploy to AWS EC2 instance')
        string(name: 'EC2_HOST', defaultValue: '', description: 'Public IP of AWS EC2 instance')
    }

    environment {
        APP_NAME   = 'devops-cicd-dashboard'
        IMAGE_NAME = 'devops-cicd-dashboard'
    }

    stages {
        // Stage 1: Retrieve source code from GitHub
        stage('Checkout') {
            steps {
                checkout scm
                sh 'git log -1 --oneline'
            }
        }

        // Stage 2: Check runtime tools and versions
        stage('Environment Setup') {
            steps {
                sh 'node -v'
                sh 'npm -v'
                sh 'docker --version'
            }
        }

        // Stage 3: Clean dependency installation
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        // Stage 4: Static analysis and type checking
        stage('Code Quality and Validation') {
            steps {
                sh 'npm run lint'
                sh 'npm run type-check'
            }
        }

        // Stage 5: Automated unit and API testing
        stage('Automated Testing') {
            steps {
                sh 'npm test'
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'junit.xml'
                }
            }
        }

        // Stage 6: Next.js production build
        stage('Production Build') {
            steps {
                sh 'npm run build'
            }
        }

        // Stage 7: Build multi-stage Docker image
        stage('Docker Build') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} -t ${IMAGE_NAME}:latest ."
            }
        }

        // Stage 8: Validate Docker container locally
        stage('Docker Validation') {
            steps {
                sh "docker run -d --name test-app -p 3001:3000 ${IMAGE_NAME}:latest"
                sh 'sleep 5'
                sh 'curl -f http://localhost:3001/api/health'
                sh 'docker rm -f test-app'
            }
        }

        // Stage 9: Deploy container to AWS EC2 via SSH
        stage('Deployment') {
            when {
                expression { params.DEPLOY_TO_EC2 && params.EC2_HOST }
            }
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
                    sh """
                        docker save ${IMAGE_NAME}:latest | ssh -o StrictHostKeyChecking=no -i \${SSH_KEY} \${SSH_USER}@${params.EC2_HOST} \
                        'docker load && docker rm -f ${APP_NAME} 2>/dev/null || true && docker run -d --restart unless-stopped --name ${APP_NAME} -p 80:3000 ${IMAGE_NAME}:latest'
                    """
                }
            }
        }

        // Stage 10: Verify live deployment health
        stage('Post-Deployment Verification') {
            when {
                expression { params.DEPLOY_TO_EC2 && params.EC2_HOST }
            }
            steps {
                sh 'sleep 5'
                sh "curl -f http://${params.EC2_HOST}/api/health"
                echo "Application successfully deployed and running at: http://${params.EC2_HOST}"
            }
        }
    }

    post {
        always {
            sh 'docker rm -f test-app 2>/dev/null || true'
        }
        success {
            echo "Build #${BUILD_NUMBER} finished successfully!"
        }
        failure {
            echo "Build #${BUILD_NUMBER} failed. Please review console logs."
        }
    }
}
