import { Meteor } from 'meteor/meteor';
import { LWMeteor } from '/imports/startup/lightwire';

const UserInfos = new LWMeteor.Collection('users-infos');

if (Meteor.isServer) {
  UserInfos._ensureIndex({ meetingId: 1, userId: 1 });
}

export default UserInfos;
