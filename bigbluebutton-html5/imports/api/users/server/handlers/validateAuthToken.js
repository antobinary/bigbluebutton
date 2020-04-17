import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import userJoin from './userJoin';
import ClientConnections from '/imports/startup/server/ClientConnections';
import upsertValidationState from '/imports/api/auth-token-validation/server/modifiers/upsertValidationState';
import removeValidationState from '/imports/api/auth-token-validation/server/modifiers/removeValidationState';
import { ValidationStates } from '/imports/api/auth-token-validation';

export default function handleValidateAuthToken({ body }, meetingId) {
  const {
    userId, valid, waitForApproval, authToken,
  } = body;

  check(userId, String);
  check(valid, Boolean);
  check(waitForApproval, Boolean);

  // akka-apps responded with valid: Boolean
  const sessionId = `${meetingId}--${userId}`;
  const connection = ClientConnections.getActiveConnectionsFor(sessionId);
  const connectionId = connection ? connection.id : null;
  Logger.info(`ValidateAuthToken back to meteor. valid=${valid}  for ${sessionId}`);


  /* start of CAN_BE_REMOVED_ONCE_FLASH_CLIENT_REMOVED */
  // const selector = {
  //   meetingId,
  //   userId,
  //   clientType: 'HTML5',
  // };
  // const User = Users.findOne(selector);
  //
  // console.error('case 001', body);
  // // If we dont find the user on our collection is a flash user and we can skip
  // if (!User) {
  //   console.error('case 002');
  //   Logger.warn(`handlers/validateAuthToken.js We picked the response for a Flash user ${sessionId}`);
  //   return;
  // }
  /* end of CAN_BE_REMOVED_ONCE_FLASH_CLIENT_REMOVED */

  console.error('case 003');
  if (!valid) {
    upsertValidationState(meetingId, userId, ValidationStates.INVALID, connectionId);
    // TODO remove [dummy] user from db. Auth token validation failed.
    // if not valid TODO - close connection
  } else if (!connectionId) {
    console.error('case 014');
    // Closed session before finishing user join process.

    // upsertValidationState(meetingId, userId, ValidationStates.NOT_VALIDATED, connectionId);
    removeValidationState(meetingId, userId, connectionId);
    // TODO remove [dummy] user from db.
  } else {
    console.error('case 005 - so far so good', connectionId);
    upsertValidationState(meetingId, userId, ValidationStates.VALIDATED, connectionId);

    // TODO send joining request
    if (waitForApproval) {
      //
      console.error('case 006');
    } else {
      console.error('case 007');
      // Has active connection and passed token validation. Join
      userJoin(meetingId, userId, authToken);
    }
    console.error('case 008');
    // const modifier = {
    //   $set: {
    //     validated: valid,
    //     approved: !waitForApproval,
    //     loginTime: Date.now(),
    //     inactivityCheck: false,
    //   },
    // };
    // const cb = (err, numChanged) => {
    //   if (err) {
    //     return Logger.error(`Validating auth token: ${err}`);
    //   }
    //
    //   if (numChanged) {
    //     // if (valid) {
    //     //   const sessionUserId = `${meetingId}-${userId}`;
    //     //   const currentConnectionId = User.connectionId ? User.connectionId : false;
    //     //   clearOtherSessions(sessionUserId, currentConnectionId);
    //     // }
    //
    //     return Logger.info(`Validated auth token as ${valid} user=${userId} meeting=${meetingId}`);
    //   }
    //
    //   return Logger.info('No auth to validate');
    // };
    console.error('case 011');
    // Users.update(selector, modifier, cb);
  }

  console.error('case 013');
}
