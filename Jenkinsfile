node {
  stage('install') {
    sh 'node install'
  }
  stage('run') {
    sh 'docker run --add-host=mongo-local:172.17.0.1 --name resource-api -p 3001:3001 -v recording-images:/usr/src/app/images martin31/resource-api'
  }
}