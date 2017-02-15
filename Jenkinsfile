node('basic') {
  def commit_id
  def app
  def tag

  stage('Checkout source') {
    slackSend teamDomain: 'mafiascum', tokenCredentialId: 'mafiascum-slack-token', message: "*[Forum]* Build #${env.BUILD_NUMBER} started (${env.BUILD_URL})"
    checkout scm
    sh 'git rev-parse HEAD > .git-commit-id'
    commit_id = readFile('.git-commit-id').trim()
  }

  stage('Build image') {
    app = docker.build 'mafiascum/forum'
  }

  stage('Push image') {
    withCredentials([string(credentialsId: 'docker-hub-password', variable: 'DOCKER_HUB_PASSWORD')]) {
      sh 'docker login --username ccatlett2000 --password $DOCKER_HUB_PASSWORD'
    }
    tag = "${env.BRANCH_NAME}-${commit_id}"
    app.push "${tag}"
  }

  stage('Deploy to cluster') {
    milestone()
    sh "kubectl --namespace ccatlett2000 set image deployment forum forum=mafiascum/site-chat-server:${tag}"
    slackSend teamDomain: 'mafiascum', tokenCredentialId: 'mafiascum-slack-token', color: 'good', message: "*[Forum]* Commit `${commit_id}` deployed to staging"
  }
}
