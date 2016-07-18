##!/usr/bin/env bash
#sudo chmod -R 777 /usr/share/red5/webapps
#gradle clean war deploy
#sudo chmod -R 777 /usr/share/red5/webapps

#!/bin/bash
# deploying 'screenshare' to /usr/share/red5/webapps

sbt clean
sbt compile
sbt package
if [[ -d /usr/share/red5/webapps/screenshare ]]; then
    sudo rm -r /usr/share/red5/webapps/screenshare
fi
sudo cp -r target/webapp/ /usr/share/red5/webapps/screenshare


sudo rm -rf /usr/share/red5/webapps/screenshare/WEB-INF/lib/*
sudo cp ~/dev/bigbluebutton/bbb-screenshare/app/target/webapp/WEB-INF/lib/bbb-screenshare-akka_2.11-0.0.1.jar \
 ~/dev/bigbluebutton/bbb-screenshare/app/target/webapp/WEB-INF/lib/scala-library-* \
 ~/dev/bigbluebutton/bbb-screenshare/app/target/webapp/WEB-INF/lib/akka-* \
 ~/dev/bigbluebutton/bbb-screenshare/app/target/webapp/WEB-INF/lib/config-1.3.0.jar \
 ~/dev/bigbluebutton/bbb-screenshare/app/target/webapp/WEB-INF/lib/gson-1.7.1.jar \
 ~/dev/bigbluebutton/bbb-screenshare/app/target/webapp/WEB-INF/lib/jedis-2.7.2.jar \
 ~/dev/bigbluebutton/bbb-screenshare/app/target/webapp/WEB-INF/lib/spring-webmvc-4.2.5.RELEASE.jar  \
  /usr/share/red5/webapps/screenshare/WEB-INF/lib/


#sudo mkdir /usr/share/red5/webapps/screenshare/WEB-INF/classes
cd /usr/share/red5/webapps/screenshare/WEB-INF/classes/
sudo jar -xf ../lib/bbb-screenshare-akka_2.11-0.0.1.jar
sudo rm /usr/share/red5/webapps/screenshare/WEB-INF/lib/bbb-screenshare-akka_2.11-0.0.1.jar

cd /usr/share/red5/webapps/screenshare
sudo mkdir lib
cd lib
sudo cp -r ~/dev/bigbluebutton/bbb-screenshare/app/jws/lib/* .
cd ..
sudo cp ~/dev/bigbluebutton/bbb-screenshare/app/jws/screenshare.jnlp .

sudo chmod -R 777 /usr/share/red5/webapps/screenshare
sudo chown -R red5:red5 /usr/share/red5/webapps/screenshare

# TODO change the owner username to 'firstuser'

