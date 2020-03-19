import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import userJoin from './userJoin';
import ClientConnections from '/imports/startup/server/ClientConnections';

const clearOtherSessions = (sessionUserId, current = false) => {
  const serverSessions = Meteor.server.sessions;
  Object.keys(serverSessions)
    .filter(i => serverSessions[i].userId === sessionUserId)
    .filter(i => i !== current)
    .forEach(i => serverSessions[i].close());
};

export default function handleValidateAuthToken({ body }, meetingId) {
  const { userId, valid, waitForApproval } = body;

  check(userId, String);
  check(valid, Boolean);
  check(waitForApproval, Boolean);

  const selector = {
    meetingId,
    userId,
    clientType: 'HTML5',
  };

  // akka-apps responded with valid: Boolean
  const sessionId = `${meetingId}--${userId}`;
  Logger.error(`ValidateAuthToken back to meteor. valid=${valid}  for ${sessionId}`)
  // if not valid TODO - close connection

  // if valid
  if (valid) {
    // if connection is not active TODO -  nothing? or try closing

    // const connectionForUser = ClientConnections.getConnectionsForSessionId(sessionId);
    const connectionForUser = ClientConnections.hasActiveConnection(sessionId);
    Logger.error(`^^^^connectionForUser(${sessionId}= ${connectionForUser}`);

  }
  // debugger
  const User = Users.findOne(selector);
  // console.error(`User name ${User.name}, ${!!User.connectionId}`)

  // If we dont find the user on our collection is a flash user and we can skip
  if (!User) return;

  // Publish user join message
  if (valid && !waitForApproval && !!User.connectionId) {
    // Logger.info('from BBB: User=', User);


    userJoin(meetingId, userId, User.authToken);
  }

  const modifier = {
    $set: {
      validated: valid,
      approved: !waitForApproval,
      loginTime: Date.now(),
      inactivityCheck: false,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Validating auth token: ${err}`);
    }

    if (numChanged) {
      if (valid) {
        const sessionUserId = `${meetingId}-${userId}`;
        const currentConnectionId = User.connectionId ? User.connectionId : false;
        clearOtherSessions(sessionUserId, currentConnectionId);
      }

      return Logger.info(`Validated auth token as ${valid} user=${userId} meeting=${meetingId}`);
    }

    return Logger.info('No auth to validate');
  };

  Users.update(selector, modifier, cb);
}
