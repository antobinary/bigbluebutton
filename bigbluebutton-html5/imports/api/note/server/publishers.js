import { LWMeteor } from '/imports/startup/lightwire';
import Logger from '/imports/startup/server/logger';
import Note from '/imports/api/note';
import AuthTokenValidation, { ValidationStates } from '/imports/api/auth-token-validation';

function note() {
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing Note was requested by unauth connection ${this.connection.id}`);
    return Note.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;

  Logger.info(`Publishing Note for ${meetingId} ${userId}`);

  return Note.find({ meetingId });
}

function publish(...args) {
  const boundNote = note.bind(this);
  return boundNote(...args);
}

LWMeteor.publish('note', publish);
