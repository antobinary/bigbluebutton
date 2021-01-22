import { Meteor } from 'meteor/meteor';
import { LWMeteor } from '/imports/startup/lightwire';

const Note = new LWMeteor.Collection('note');

if (Meteor.isServer) {
  Note._ensureIndex({ meetingId: 1, noteId: 1 });
}

export default Note;
