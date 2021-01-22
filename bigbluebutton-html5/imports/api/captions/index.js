import { Meteor } from 'meteor/meteor';
import { LWMeteor } from '/imports/startup/lightwire';

const Captions = new LWMeteor.Collection('captions');

if (Meteor.isServer) {
  Captions._ensureIndex({ meetingId: 1, padId: 1 });
}

export default Captions;
