import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import ClientConnections from '/imports/startup/server/ClientConnections';

export default function userLeaving(meetingId, userId, connectionId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'UserLeaveReqMsg';

  check(userId, String);
  // connection got disconnected. Remove from ClientConnections
  ClientConnections.removeConnection(`${meetingId}--${userId}`, connectionId);

  const payload = {
    userId,
    sessionId: meetingId,
  };

  Logger.info(`User '${userId}' is leaving meeting '${meetingId}' (userLeaving method triggered on disconnect)`);
  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, userId, payload);
}
