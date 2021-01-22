import { Meteor } from 'meteor/meteor';
import { LWMeteor } from '/imports/startup/lightwire';

const Presentations = new LWMeteor.Collection('presentations');

if (Meteor.isServer) {
  // types of queries for the presentations:
  // 1. meetingId, podId, id        ( 3 )
  // 2. meetingId, id               ( 1 )
  // 3. meetingId, id, current      ( 2 )
  // 4. meetingId                   ( 1 )

  Presentations._ensureIndex({ meetingId: 1, podId: 1, id: 1 });
}

export default Presentations;
