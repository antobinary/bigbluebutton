import { Meteor } from 'meteor/meteor';
import { LWMeteor } from '/imports/startup/lightwire';

const Screenshare = new LWMeteor.Collection('screenshare');

if (Meteor.isServer) {
  // types of queries for the screenshare:
  // 1. meetingId

  Screenshare._ensureIndex({ meetingId: 1 });
}

export default Screenshare;
