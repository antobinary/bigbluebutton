import { Meteor } from 'meteor/meteor';
import { LWMeteor } from '/imports/startup/lightwire';

const UserSettings = new LWMeteor.Collection('users-settings');

if (Meteor.isServer) {
  UserSettings._ensureIndex({
    meetingId: 1, userId: 1,
  });
}

export default UserSettings;
