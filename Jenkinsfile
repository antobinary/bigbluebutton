pipeline {
    agent none
    stages {
        stage("prepare filesystem") {
            agent any
            steps {
                dir('build') {
                    git url: 'git@github.com:bigbluebutton/build.git'
                }
                dir('freeswitch') {
                    git url: 'https://github.com/signalwire/freeswitch.git'
                }
                sh "cd freeswitch ; git checkout v1.10.5 ; cd .."
                dir('bbb-webrtc-sfu') {
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
                    dir 'build/docker/bionic'
                    label 'master'
                    args '-v /tmp/build:/tmp/build -v ${workspace}/:/mnt/bigbluebutton-build -u root'
                }
            }
            
            steps {
                sh "ls /mnt"
                sh "ls -l /mnt/bigbluebutton-build"
                sh "SOURCE=/mnt/bigbluebutton-build PACKAGE=bbb-html5 /mnt/bigbluebutton-build/setup.sh"
            }
        }
    }
}
