import Users from '/imports/api/users';
import { Meteor } from 'meteor/meteor';
import { LWMeteor } from '/imports/startup/lightwire';
import Logger from '/imports/startup/server/logger';
import AuthTokenValidation, { ValidationStates } from '/imports/api/auth-token-validation';
import { extractCredentials } from '/imports/api/common/server/helpers';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

function currentUser() {
  if (!this.userId) {
    return Users.find({ meetingId: '' });
    // return Users.find({ connectionId: this.connection.id }); // TODO ANTON - check do we want this
  }
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  check(meetingId, String);
  check(requesterUserId, String);

  const selector = {
    meetingId,
    userId: requesterUserId,
  };

  const options = {
    fields: {
      user: false,
      authToken: false, // Not asking for authToken from client side but also not exposing it
    },
  };

  return Users.find(selector, options);
}

function publishCurrentUser(...args) {
  const boundUsers = currentUser.bind(this);
  return boundUsers(...args);
}

LWMeteor.publish('current-user', publishCurrentUser);

function users(role) {
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing Users was requested by unauth connection ${this.connection.id}`);
    return Users.find({ meetingId: '' });
  }

  if (!this.userId) {
    return Users.find({ meetingId: '' });
  }
  const { meetingId, userId } = tokenValidation;

  Logger.debug(`Publishing Users for ${meetingId} ${userId}`);

  let selector = doc => doc.meetingId === meetingId
    && !!doc.intId;

  const User = Users.findOne({ userId, meetingId }, { fields: { role: 1 } });
  if (!!User && User.role === ROLE_MODERATOR) {
    selector = doc => (doc.meetingId === meetingId
      && !!doc.intId)
      || (!!doc.intId
        && doc.breakoutProps.isBreakoutUser === true
        && doc.breakoutProps.parentId === meetingId
      );
  }

  const options = {
    fields: {
      authToken: false,
    },
  };

  Logger.debug('Publishing Users', { meetingId, userId });

  return Users.find(selector, options);
}

function publish(...args) {
  const boundUsers = users.bind(this);
  return boundUsers(...args);
}

LWMeteor.publish('users', publish);
