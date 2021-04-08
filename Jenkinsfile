pipeline {
    agent none
    stages {
        stage("prepare filesystem") {
            agent any
            steps {
                dir('bigbluebutton') {
                    git url: 'https://github.com/bigbluebutton/bigbluebutton.git', branch: "develop"
                }
                dir('bigbluebutton/freeswitch') {
                    git url: 'https://github.com/signalwire/freeswitch.git'
                }
                sh "cd bigbluebutton/freeswitch ; git checkout v1.10.5 ; cd ../.."
                dir('bigbluebutton/bbb-webrtc-sfu') {
                    git url: 'https://github.com/bigbluebutton/bbb-webrtc-sfu', branch: "development"
                }
                sh "mkdir -p /tmp/build"
                sh "chmod 777 /tmp/build"
            }
        }
        stage("build bbb") {
            agent {
                dockerfile {
                    filename 'Dockerfile'
                    dir 'docker/bionic'
                    label 'master'
                    args '-v /tmp/build:/tmp/build -v ${workspace}/:/mnt/bigbluebutton-build -u root'
                }
            }
            
            steps {
                sh "ls /mnt"
                sh "/mnt/bigbluebutton-build/setup-inside-docker.sh"
            }
        }
    }
}
