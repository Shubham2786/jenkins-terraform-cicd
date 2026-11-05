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
        stage('Checkout') {
            steps {
                checkout scm
                sh 'git log -1 --oneline'
            }
        }

        stage('Environment Setup') {
            steps {
                sh 'node -v && npm -v && docker --version'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Code Quality and Validation') {
            steps {
                sh 'npm run lint && npm run type-check'
            }
        }

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

        stage('Production Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Docker Build') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} -t ${IMAGE_NAME}:latest ."
            }
        }

        stage('Docker Validation') {
            steps {
                sh """
                    docker run -d --name test-app -p 3001:3000 ${IMAGE_NAME}:latest
                    sleep 5
                    curl -f http://localhost:3001/api/health
                    docker rm -f test-app
                """
            }
        }

        stage('Deployment') {
            when {
                expression { params.DEPLOY_TO_EC2 && params.EC2_HOST }
            }
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
                    sh "docker save ${IMAGE_NAME}:latest | ssh -o StrictHostKeyChecking=no -i ${SSH_KEY} ${SSH_USER}@${params.EC2_HOST} 'docker load && docker rm -f ${APP_NAME} || true && docker run -d --restart unless-stopped --name ${APP_NAME} -p 80:3000 ${IMAGE_NAME}:latest'"
                }
            }
        }

        stage('Post-Deployment Verification') {
            when {
                expression { params.DEPLOY_TO_EC2 && params.EC2_HOST }
            }
            steps {
                sh "sleep 5 && curl -f http://${params.EC2_HOST}/api/health"
            }
        }
    }

    post {
        always {
            sh 'docker rm -f test-app 2>/dev/null || true'
        }
        success {
            echo "Build #${BUILD_NUMBER} completed successfully!"
        }
        failure {
            echo "Build #${BUILD_NUMBER} failed."
        }
    }
}
