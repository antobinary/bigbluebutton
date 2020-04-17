import Logger from '/imports/startup/server/logger';
import AuthTokenValidation from '/imports/api/auth-token-validation';

// selector follows the format {meetingId, userId, connectionId, validationStatus}
export default function upsertValidationState(meetingId, userId, validationStatus, connectionId) {
  const selector = {
    meetingId, userId, connectionId,
  };
  const modifier = {
    $set: {
      meetingId,
      userId,
      connectionId,
      validationStatus,
    },
  };
  const cb = (err, numChanged) => {
    if (err) {
      Logger.error(`Could not upsert to collection AuthTokenValidation: ${err}`);
      return;
    }
    if (numChanged) {
      console.info(`Upserted ${JSON.stringify(selector)} ${validationStatus} in AuthTokenValidation`);
      // Logger.debug(`Upserted ${selector.toString()} in AuthTokenValidation`);
    }
  };

  return AuthTokenValidation.upsert(selector, modifier, cb);
}
