import { Meteor } from 'meteor/meteor';
import { LWMeteor } from '/imports/startup/lightwire';

const ConnectionStatus = new LWMeteor.Collection('connection-status');

if (Meteor.isServer) {
  ConnectionStatus._ensureIndex({ meetingId: 1, userId: 1 });
}

export default ConnectionStatus;
