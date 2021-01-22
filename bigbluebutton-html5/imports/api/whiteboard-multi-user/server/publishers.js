import WhiteboardMultiUser from '/imports/api/whiteboard-multi-user/';
import { LWMeteor } from '/imports/startup/lightwire';
import Logger from '/imports/startup/server/logger';
import AuthTokenValidation, { ValidationStates } from '/imports/api/auth-token-validation';

function whiteboardMultiUser() {
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing WhiteboardMultiUser was requested by unauth connection ${this.connection.id}`);
    return WhiteboardMultiUser.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;

  Logger.debug('Publishing WhiteboardMultiUser', { meetingId, userId });

  return WhiteboardMultiUser.find({ meetingId });
}


function publish(...args) {
  const boundMultiUser = whiteboardMultiUser.bind(this);
  return boundMultiUser(...args);
}

LWMeteor.publish('whiteboard-multi-user', publish);
