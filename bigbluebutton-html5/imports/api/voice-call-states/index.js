import { Meteor } from 'meteor/meteor';
import { LWMeteor } from '/imports/startup/lightwire';

const VoiceCallStates = new LWMeteor.Collection('voiceCallStates');

if (Meteor.isServer) {
  // types of queries for the voice users:
  // 1. intId
  // 2. meetingId, intId

  VoiceCallStates._ensureIndex({ meetingId: 1, userId: 1 });
}

export default VoiceCallStates;
