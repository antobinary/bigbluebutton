import { Meteor } from 'meteor/meteor';
import { LWMeteor } from '/imports/startup/lightwire';

const Breakouts = new LWMeteor.Collection('breakouts');

if (Meteor.isServer) {
  // types of queries for the breakouts:
  // 1. breakoutId ( handleJoinUrl, roomStarted, clearBreakouts )
  // 2. parentMeetingId ( updateTimeRemaining )

  Breakouts._ensureIndex({ breakoutId: 1 });
  Breakouts._ensureIndex({ parentMeetingId: 1 });
}

export default Breakouts;
