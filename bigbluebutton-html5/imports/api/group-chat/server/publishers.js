import GroupChat from '/imports/api/group-chat';
import { Meteor } from 'meteor/meteor';
import { LWMeteor } from '/imports/startup/lightwire';

import Logger from '/imports/startup/server/logger';
import AuthTokenValidation, { ValidationStates } from '/imports/api/auth-token-validation';

function groupChat() {
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing GroupChat was requested by unauth connection ${this.connection.id}`);
    return GroupChat.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;

  const CHAT_CONFIG = Meteor.settings.public.chat;
  const PUBLIC_CHAT_TYPE = CHAT_CONFIG.type_public;

  Logger.debug('Publishing group-chat', { meetingId, userId });

  const selector = doc => doc.meetingId === meetingId && (doc.access === PUBLIC_CHAT_TYPE || (Array.isArray(doc.users) && doc.users.includes(requesterUserId)));

  return GroupChat.find(selector);
}

function publish(...args) {
  const boundGroupChat = groupChat.bind(this);
  return boundGroupChat(...args);
}

LWMeteor.publish('group-chat', publish);
