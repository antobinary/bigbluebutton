import { Meteor } from 'meteor/meteor';
import AuthTokenValidation from '/imports/api/auth-token-validation';
import Logger from '/imports/startup/server/logger';

// const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

function authTokenValidation({ meetingId, userId }) {
  // if (!this.userId) {
  //   return Meetings.find({ meetingId: '' });
  // }
  // const { meetingId, requesterUserId } = extractCredentials(this.userId);
  //
  // Logger.debug(`Publishing meeting =${meetingId} ${requesterUserId}`);
  //
  const connectionId = this.connection.id;
  const selector = {
    meetingId,
    userId,
    connectionId,
  };

  const options = {
    fields: {
      // password: false,
    },
  };
  // TODO make sure you cannot get the token state for other connections

  return AuthTokenValidation.find(selector, options);
}

function publish(...args) {
  const boundAuthTokenValidation = authTokenValidation.bind(this);
  return boundAuthTokenValidation(...args);
}

Meteor.publish('authtokenvalidation', publish);
