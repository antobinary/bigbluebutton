import Annotations from '/imports/api/annotations';
import { LWMeteor } from '/imports/startup/lightwire';
import Logger from '/imports/startup/server/logger';
import AuthTokenValidation, { ValidationStates } from '/imports/api/auth-token-validation';

function annotations() {
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing Annotations was requested by unauth connection ${this.connection.id}`);
    return Annotations.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;

  Logger.debug('Publishing Annotations', { meetingId, userId });

  return Annotations.find({ meetingId });
}

function publish(...args) {
  const boundAnnotations = annotations.bind(this);
  return boundAnnotations(...args);
}

LWMeteor.publish('annotations', publish);
