import { Meteor } from 'meteor/meteor';
import { LWMeteor } from '/imports/startup/lightwire';

const VideoStreams = new LWMeteor.Collection('video-streams');

if (Meteor.isServer) {
  // types of queries for the video users:
  // 2. meetingId

  VideoStreams._ensureIndex({ meetingId: 1 });
}

export default VideoStreams;
