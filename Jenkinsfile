pipeline {
    agent any
    
    environment {
        // Docker Hub 계정 정보 (Jenkins Credentials에 등록된 ID)
        DOCKER_HUB_CREDENTIALS = credentials('jeongsoo-docker-hub')
        // Docker 이미지 이름과 태그
        DOCKER_IMAGE_NAME = 'kimjeongsoo/weebee-front'
        DOCKER_IMAGE_TAG = "latest"
        // EC2 SSH 접속 정보 (Jenkins Credentials에 등록된 ID)
        EC2_SSH_CREDENTIALS = credentials('front-ec2-ssh')
        // EC2 접속 정보
        EC2_HOST = '52.78.4.114' // 실제 EC2 인스턴스 IP
        EC2_USER = 'ubuntu' // EC2 사용자명 (Amazon Linux는 ec2-user, Ubuntu는 ubuntu)
    }
    
    stages {
        stage('Checkout') {
            steps {
                // GitHub에서 소스코드 체크아웃
                checkout scm
            }
        }
        
        stage('Build Docker Image') {
            steps {
                // Docker 이미지 빌드 (작업 디렉토리 확인)
                sh 'ls -la'
                sh 'pwd'
                
                // 저장소 루트에 Dockerfile이 없으면 front 디렉토리로 이동하여 빌드
                sh '''
                    if [ -f "Dockerfile" ]; then
                        echo "Dockerfile found in root directory"
                        docker build -t ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} -t ${DOCKER_IMAGE_NAME}:latest .
                    elif [ -d "front" ] && [ -f "front/Dockerfile" ]; then
                        echo "Dockerfile found in front directory"
                        cd front
                        docker build -t ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} -t ${DOCKER_IMAGE_NAME}:latest .
                    else
                        echo "ERROR: Dockerfile not found in root or front directory"
                        exit 1
                    fi
                '''
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                // Docker Hub 로그인
                sh 'echo ${DOCKER_HUB_CREDENTIALS_PSW} | docker login -u ${DOCKER_HUB_CREDENTIALS_USR} --password-stdin'
                
                // Docker 이미지 푸시 (버전 태그 및 latest 태그)
                sh 'docker push ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}'
                sh 'docker push ${DOCKER_IMAGE_NAME}:latest'
                
                // Docker Hub 로그아웃
                sh 'docker logout'
            }
        }
        
        stage('Deploy to EC2') {
            steps {
                // EC2 서버에 SSH로 접속하여 배포 스크립트 실행
                sshagent(['front-ec2-ssh']) {
                    // 기존 컨테이너 중지 및 삭제, 새 이미지 가져오기, 컨테이너 실행
                    sh """
                        ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} '
                            # 기존 컨테이너가 있으면 중지 및 삭제
                            docker stop weebee-frontend || true
                            docker rm weebee-frontend || true
                            
                            # 최신 이미지 가져오기
                            docker pull kimjeongsoo/weebee-front:latest
                            
                            # 새 컨테이너 실행
                            docker run -d -p 3000:3000 --restart unless-stopped --name weebee-frontend kimjeongsoo/weebee-front:latest
                            
                            # 사용하지 않는 이미지 정리
                            docker image prune -af
                        '
                    """
                }
            }
        }
    }
    
    post {
        always {
            // 빌드 후 정리 작업
            sh 'docker image prune -af'
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
