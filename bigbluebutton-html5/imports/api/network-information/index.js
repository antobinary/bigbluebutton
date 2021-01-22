import { Meteor } from 'meteor/meteor';
import { LWMeteor } from '/imports/startup/lightwire';

const NetworkInformation = new LWMeteor.Collection('network-information');

if (Meteor.isServer) {
  NetworkInformation._ensureIndex({ meetingId: 1 });
}

export default NetworkInformation;
