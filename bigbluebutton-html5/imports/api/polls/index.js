import { Meteor } from 'meteor/meteor';
import { LWMeteor } from '/imports/startup/lightwire';

const Polls = new LWMeteor.Collection('polls');

if (Meteor.isServer) {
  // We can have just one active poll per meeting
  // makes no sense to index it by anything other than meetingId

  Polls._ensureIndex({ meetingId: 1 });
}

export default Polls;
