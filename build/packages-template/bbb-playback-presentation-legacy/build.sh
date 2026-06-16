#!/bin/bash -ex

TARGET=`basename $(pwd)`


PACKAGE=$(echo $TARGET | cut -d'_' -f1)
VERSION=$(echo $TARGET | cut -d'_' -f2)
DISTRO=$(echo $TARGET | cut -d'_' -f3)

#
# Clear staging directory for build
rm -rf staging

#
# Stage only the standalone legacy players (0.81/0.9.0). These used to be part
# of bbb-playback-presentation; they now ship here so they are not installed by
# default. The source dir is record-and-playback/presentation, so the players
# are available under ./playback/presentation/.
mkdir -p staging/var/bigbluebutton/playback/presentation
cp -r playback/presentation/0.81 \
      playback/presentation/0.9.0 \
      staging/var/bigbluebutton/playback/presentation/

mkdir -p staging/usr/share/bigbluebutton/nginx
cp playback-legacy.nginx staging/usr/share/bigbluebutton/nginx

##

. ./opts-$DISTRO.sh

#
# Build package
#
# --replaces declares the file hand-off from bbb-playback-presentation, which
# previously owned these dirs, so dpkg does not report a file conflict when this
# package takes them over. (Debian's Breaks field would also force an old
# bbb-playback-presentation to be upgraded first, closing the transition window,
# but fpm has no --breaks flag; --replaces is sufficient for this opt-in package,
# and after-install.sh guides the admin if a transition conflict ever occurs.)
# The value contains spaces, so it is passed here directly rather than through
# $OPTS (which is expanded unquoted and would word-split it).
fpm -s dir -C ./staging -n $PACKAGE \
    --version $VERSION --epoch $EPOCH \
    --after-install after-install.sh \
    --replaces "bbb-playback-presentation (<< ${EPOCH}:${VERSION})" \
    --description "Standalone legacy BigBlueButton recording players (0.81/0.9.0)" \
    $OPTS
