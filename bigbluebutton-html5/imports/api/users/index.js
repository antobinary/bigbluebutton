import { LWMeteor } from '/imports/startup/lightwire';

const Users = new LWMeteor.Collection('users');

if (Meteor.isServer) {
  // types of queries for the users:
  // 1. meetingId
  // 2. meetingId, userId

  Users._ensureIndex({ meetingId: 1, userId: 1 });
}

export default Users;
