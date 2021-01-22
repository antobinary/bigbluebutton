import { Meteor } from 'meteor/meteor';
import { LWMeteor } from '/imports/startup/lightwire';

const LocalSettings = new LWMeteor.Collection('local-settings');

if (Meteor.isServer) {
  LocalSettings._ensureIndex({
    meetingId: 1, userId: 1,
  });
}

export default LocalSettings;
