mkdir workdir
cp ffmpeg-2.8.5-1.2-SNAPSHOT.jar workdir/ffmpeg.jar
ant sign-ffmpeg-jar
cp workdir/ffmpeg.jar ../../../app/jws/lib/
rm -rf workdir

