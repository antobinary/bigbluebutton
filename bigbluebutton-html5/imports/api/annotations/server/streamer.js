import Logger from '/imports/startup/server/logger';
import { LWMeteor } from '/imports/startup/lightwire';

export function removeAnnotationsStreamer(meetingId) {
  Logger.info(`Removing Annotations streamer object for meeting ${meetingId}`);
  delete LWMeteor.StreamerCentral.instances[`annotations-${meetingId}`];
}

export function addAnnotationsStreamer(meetingId) {
  const streamer = new LWMeteor.Streamer(`annotations-${meetingId}`, { retransmit: false });

  streamer.allowRead(function allowRead() {
    if (!this.userId) return false;

    return this.userId && this.userId.includes(meetingId);
  });

  streamer.allowWrite(function allowWrite() {
    return false;
  });
}

export default function get(meetingId) {
  return LWMeteor.StreamerCentral.instances[`annotations-${meetingId}`];
}
