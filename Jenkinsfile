pipeline {
    agent any

    parameters {
        booleanParam(name: 'DEPLOY_TO_EC2', defaultValue: false, description: 'Deploy to AWS EC2 instance')
        string(name: 'EC2_HOST', defaultValue: '', description: 'Public IP of AWS EC2 instance')
    }

    stages {
        stage('Checkout & Install') {
            steps {
                checkout scm
                sh 'npm ci'
            }
        }

        stage('Test & Lint') {
            steps {
                sh 'npm run lint && npm test'
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'junit.xml'
                }
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
            when {
                expression { params.DEPLOY_TO_EC2 && params.EC2_HOST }
            }
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
                    sh """
                        docker save devops-cicd-dashboard:latest | ssh -o StrictHostKeyChecking=no -i ${SSH_KEY} ${SSH_USER}@${params.EC2_HOST} \
                        'docker load && docker rm -f devops-cicd-dashboard || true && docker run -d --restart unless-stopped --name devops-cicd-dashboard -p 80:3000 devops-cicd-dashboard:latest'
                        sleep 5
                        curl -f http://${params.EC2_HOST}/api/health
                    """
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline succeeded!"
        }
        failure {
            echo "Pipeline failed."
        }
    }
}
