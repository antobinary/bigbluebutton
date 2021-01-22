import { LWMeteor } from '/imports/startup/lightwire';
import AuthTokenValidation from '/imports/api/auth-token-validation';
import Logger from '/imports/startup/server/logger';

function authTokenValidation({ meetingId, userId }) {
  const selector = {
    meetingId,
    userId,
  };

  Logger.debug(`Publishing auth-token-validation for ${meetingId} ${userId}`);

  return AuthTokenValidation.find(selector);
}

function publish(...args) {
  const boundAuthTokenValidation = authTokenValidation.bind(this);
  return boundAuthTokenValidation(...args);
}

LWMeteor.publish('auth-token-validation', publish);
