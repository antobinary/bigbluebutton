import { Meteor } from 'meteor/meteor';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
// import Users from '/imports/api/users';
// import createDummyUser from '../modifiers/createDummyUser';
// import setConnectionIdAndAuthToken from '../modifiers/setConnectionIdAndAuthToken';
import ClientConnections from '/imports/startup/server/ClientConnections';
import userLeaving from './userLeaving';
import upsertValidationState from '/imports/api/auth-token-validation/server/modifiers/upsertValidationState';
import { ValidationStates } from '/imports/api/auth-token-validation';

export default function validateAuthToken(meetingId, requesterUserId, requesterToken) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ValidateAuthTokenReqMsg';

  const sessionId = `${meetingId}--${requesterUserId}`;
  const connectionId = this.connection.id;
  // Do I need to attach the onCloseConnection prior to addConnection? TODO
  if (!ClientConnections.addConnection(sessionId, this.connection)) return;
  const onCloseConnection = Meteor.bindEnvironment(() => {
    try {
      userLeaving(meetingId, requesterUserId, connectionId);
    } catch (e) {
      Logger.error(`Exception while executing userLeaving: ${e}`);
    }
  });

  this.connection.onClose(() => {
    onCloseConnection();
  });
  this.setUserId(sessionId);

  // const User = Users.findOne({
  //   meetingId,
  //   userId: requesterUserId,
  // });

  // if (User) {
  //   // We already have a user with this sessionId, do not request ValidateAuthTokenReqMsg
  //   Logger.warn(`We already have a user with this sessionId=${sessionId}, do not request ValidateAuthTokenReqMsg`);
  //   return;
  // }


  // new user
  upsertValidationState(meetingId, requesterUserId, ValidationStates.VALIDATING, connectionId);
  // createDummyUser(meetingId, requesterUserId, requesterToken);
  // setConnectionIdAndAuthToken(meetingId, requesterUserId, connectionId, requesterToken);

  const payload = {
    userId: requesterUserId,
    authToken: requesterToken,
  };

  Logger.info(`methods/validateAuthToken.js: User '${requesterUserId}' is trying to validate auth token for meeting '${meetingId}'`);

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
