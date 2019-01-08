// Pod Template
def cloud = env.CLOUD ?: "kubernetes"
def serviceAccount = env.SERVICE_ACCOUNT ?: "default"

// Pod Environment Variables workshop
def namespace = env.NAMESPACE ?: "default"
def registry = env.REGISTRY ?: "mycluster.icp:8500"
def releaseName = env.RELEASE_NAME ?: "liberty-starter"
def icpUser = env.ICP_USER ?: "admin"
def icpPassword = env.ICP_PASSWORD ?: "admin"

podTemplate(label: 'mypod', cloud: cloud, serviceAccount: serviceAccount, namespace: namespace, envVars: [
        envVar(key: 'NAMESPACE', value: namespace),
        envVar(key: 'REGISTRY', value: registry),
        envVar(key: 'RELEASE_NAME', value: releaseName),
        envVar(key: 'ICP_USER', value: icpUser),
        envVar(key: 'ICP_PASSWORD', value: icpPassword)
    ],
    volumes: [
        hostPathVolume(hostPath: '/etc/docker/certs.d', mountPath: '/etc/docker/certs.d'),
        hostPathVolume(hostPath: '/var/run/docker.sock', mountPath: '/var/run/docker.sock')
    ],
    containers: [
        containerTemplate(name: 'maven', image: 'maven:3-alpine', ttyEnabled: true, command: 'cat'),
        containerTemplate(name: 'kubectl', image: 'lachlanevenson/k8s-kubectl', ttyEnabled: true, command: 'cat'),
        containerTemplate(name: 'docker' , image: 'docker:17.06.1-ce', ttyEnabled: true, command: 'cat')
  ]) {

    node('mypod') {
        checkout scm
        container('maven') {
            stage('Build application war file') {
               sh """
               #!/bin/bash
               mvn -B -DskipTests clean package
               """
            }
        }
        container('docker') {
            stage('Build Docker Image') {
                sh """
                #!/bin/bash
                docker build -t ${env.REGISTRY}/${env.NAMESPACE}/liberty-starter:${env.BUILD_NUMBER} .
                """
            }
            stage('Push Docker Image to Registry') {
                sh """
                #!/bin/bash
                docker login -u ${env.ICP_USER} -p ${env.ICP_PASSWORD} ${env.REGISTRY}
                docker push ${env.REGISTRY}/${env.NAMESPACE}/liberty-starter:${env.BUILD_NUMBER}
                """
            }
        }
        container('kubectl') {
            stage('Deploy new Docker Image') {
                sh """
                #!/bin/bash
                DEPLOYMENT=`kubectl --namespace=${env.NAMESPACE} get deployments -l app=liberty-starter,component=web-app,release=${env.RELEASE_NAME} -o name`
                kubectl --namespace=${env.NAMESPACE} get \${DEPLOYMENT}
                if [ \${?} -ne "0" ]; then
                    # No deployment to update
                    echo 'No deployment to update'
                    exit 1
                fi
                # Update Deployment
                kubectl --namespace=${env.NAMESPACE} set image \${DEPLOYMENT} ${env.RELEASE_NAME}-web=${env.REGISTRY}/${env.NAMESPACE}/liberty-starter:${env.BUILD_NUMBER}
                kubectl --namespace=${env.NAMESPACE} rollout status \${DEPLOYMENT}
                """
            }
        }
    }
}