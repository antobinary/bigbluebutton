import { Meteor } from 'meteor/meteor';
import { LWMeteor } from '/imports/startup/lightwire';
import Breakouts from '/imports/api/breakouts';
import Users from '/imports/api/users';
import Logger from '/imports/startup/server/logger';
import AuthTokenValidation, { ValidationStates } from '/imports/api/auth-token-validation';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

function breakouts(role) {
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing Breakouts was requested by unauth connection ${this.connection.id}`);
    return Breakouts.find({ meetingId: '' });
  }
  const { meetingId, userId } = tokenValidation;

  const User = Users.findOne({ userId, meetingId }, { fields: { role: 1 } });
  Logger.debug('Publishing Breakouts', { meetingId, userId });

  if (!!User && User.role === ROLE_MODERATOR) {
    const presenterSelector = doc => doc.parentMeetingId === meetingId || doc.breakoutId === meetingId;

    return Breakouts.find(presenterSelector);
  }

  const selector = doc => (doc.parentMeetingId === meetingId && doc.freeJoin === true) || (doc.parentMeetingId === meetingId && doc.users.some(user => user.userId === requesterUserId)) || doc.breakoutId === meetingId;


  return Breakouts.find(selector);
}

function publish(...args) {
  const boundBreakouts = breakouts.bind(this);
  return boundBreakouts(...args);
}

LWMeteor.publish('breakouts', publish);
