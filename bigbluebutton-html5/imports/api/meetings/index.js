import { LWMeteor } from '/imports/startup/lightwire';

const Meetings = new LWMeteor.Collection('meetings');
const RecordMeetings = new LWMeteor.Collection('record-meetings');
const MeetingTimeRemaining = new LWMeteor.Collection('meeting-time-remaining');

if (Meteor.isServer) {
  // types of queries for the meetings:
  // 1. meetingId

  Meetings._ensureIndex({ meetingId: 1 });
  RecordMeetings._ensureIndex({ meetingId: 1 });
  MeetingTimeRemaining._ensureIndex({ meetingId: 1 });
}

export {
  RecordMeetings,
  MeetingTimeRemaining,
};
export default Meetings;
