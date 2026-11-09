pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    COMPOSE_PROJECT_NAME = 'jenkins-fullstack-demo'
    IMAGE_TAG = "${env.GIT_COMMIT ?: env.BUILD_NUMBER}"
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }
    stage('Validate') {
      steps {
        sh '''
          set -eu
          test -f docker-compose.yml
          test -f api/package-lock.json
          test -f web/package-lock.json
          docker compose version
        '''
      }
    }
    stage('Test API') {
      steps {
        dir('api') {
          sh 'npm ci && npm test'
        }
      }
    }
    stage('Build images') {
      steps {
        sh '''
          set -eu
          docker build -t fullstack-demo-api:${IMAGE_TAG} ./api
          docker build -t fullstack-demo-web:${IMAGE_TAG} ./web
        '''
      }
    }
    stage('Deploy') {
      when { branch 'main' }
      steps {
        withCredentials([string(credentialsId: 'app-db-password', variable: 'APP_DB_PASSWORD')]) {
          sh '''
            set +x
            export POSTGRES_DB=tasks POSTGRES_USER=tasks
            export POSTGRES_PASSWORD="$APP_DB_PASSWORD"
            export IMAGE_TAG="$IMAGE_TAG"
          docker compose up -d --no-build
          '''
        }
      }
    }
    stage('Verify deployment') {
      when { branch 'main' }
      steps {
        sh '''
          set -eu
          attempt=0
          until curl --fail --silent http://localhost:8080/api/health; do
            attempt=$((attempt + 1))
            if [ "$attempt" -ge 20 ]; then
              docker compose logs api
              exit 1
            fi
            sleep 3
          done
        '''
      }
    }
  }

  post {
    always { echo "Pipeline finished: ${currentBuild.currentResult}" }
  }
}

