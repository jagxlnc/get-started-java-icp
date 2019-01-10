// Pod Template
def podLabel = "liberty-starter-pipeline-agent"
def cloud = env.CLOUD ?: "kubernetes"
def serviceAccount = env.SERVICE_ACCOUNT ?: "jnkns-latest-jenkins"
def registryCredsID = env.REGISTRY_CREDENTIALS ?: "registry-creds"

// Pod Environment Variables workshop
def namespace = env.NAMESPACE ?: "default"
def deploymentNS = env.DEPLOYMENT_NS ?: "app-mod-workshop"
def registry = env.REGISTRY ?: "mycluster.icp:8500"
def releaseName = env.RELEASE_NAME ?: "liberty-starter"


podTemplate(label: podLabel, cloud: cloud, serviceAccount: serviceAccount, namespace: namespace, deploymentNS: deploymentNS, envVars: [
        envVar(key: 'NAMESPACE', value: namespace),
        envVar(key: 'DEPLOYMENT_NS', value: deploymentNS),
        envVar(key: 'REGISTRY', value: registry),
        envVar(key: 'RELEASE_NAME', value: releaseName)
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

    node(podLabel) {
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
                docker build -t ${env.REGISTRY}/${env.DEPLOYMENT_NS}/liberty-starter:${env.BUILD_NUMBER} .
                """
            }
            stage('Push Docker Image to Registry') {
               withCredentials([usernamePassword(credentialsId: registryCredsID,
                                               usernameVariable: 'USERNAME',
                                               passwordVariable: 'PASSWORD')]) {
                   sh """
                   #!/bin/bash
                   docker login -u ${USERNAME} -p ${PASSWORD} ${env.REGISTRY}
                   docker push ${env.REGISTRY}/${env.DEPLOYMENT_NS}/liberty-starter:${env.BUILD_NUMBER}
                   """
               }
            }
        }
        container('kubectl') {
            stage('Deploy new Docker Image') {
                sh """
                #!/bin/bash
                DEPLOYMENT=`kubectl --namespace=${env.DEPLOYMENT_NS} get deployments -l app=liberty-starter,component=web-app,release=${env.RELEASE_NAME} --no-headers  -o name`
                kubectl --namespace=${env.DEPLOYMENT_NS} get \${DEPLOYMENT}
                if [ \${?} -ne "0" ]; then
                    # No deployment to update
                    echo 'No deployment to update'
                    exit 1
                fi
                # Update Deployment
                kubectl --namespace=${env.DEPLOYMENT_NS} set image \${DEPLOYMENT} ${env.RELEASE_NAME}-web=${env.REGISTRY}/${env.DEPLOYMENT_NS}/liberty-starter:${env.BUILD_NUMBER}
                kubectl --namespace=${env.DEPLOYMENT_NS} rollout status \${DEPLOYMENT}
                """
            }
        }
    }
}