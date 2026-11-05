
pipeline {
    agent any

    stages {

        stage('Checkout & Install') {
            steps {
                checkout scm
                sh 'npm ci'
            }
        }

        stage('Test & Lint') {
            steps {
                sh 'npm run lint'
                sh 'npm test'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker build -t devops-cicd-dashboard:latest .'
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    docker rm -f devops-cicd-dashboard || true

                    docker run -d \
                        --restart unless-stopped \
                        --name devops-cicd-dashboard \
                        -p 3000:3000 \
                        devops-cicd-dashboard:latest

                    sleep 5
                    curl -f http://localhost:3000/api/health
                '''
            }
        }
    }

    post {
        success {
            echo 'Pipeline succeeded! Application deployed successfully.'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}
