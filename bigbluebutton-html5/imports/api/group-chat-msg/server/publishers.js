import { LWMeteor } from '/imports/startup/lightwire';
import { GroupChatMsg, UsersTyping } from '/imports/api/group-chat-msg';
import { Meteor } from 'meteor/meteor';

import Logger from '/imports/startup/server/logger';
import AuthTokenValidation, { ValidationStates } from '/imports/api/auth-token-validation';

function groupChatMsg(chatsIds) {
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing GroupChatMsg was requested by unauth connection ${this.connection.id}`);
    return GroupChatMsg.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;

  const CHAT_CONFIG = Meteor.settings.public.chat;
  const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;

  Logger.debug('Publishing group-chat-msg', { meetingId, userId });
  const selector = doc => (doc.meetingId === meetingId && doc.chatId === PUBLIC_GROUP_CHAT_ID) || chatsIds.includes(doc.chatId);

  return GroupChatMsg.find(selector);
}

function publish(...args) {
  const boundGroupChat = groupChatMsg.bind(this);
  return boundGroupChat(...args);
}

LWMeteor.publish('group-chat-msg', publish);

function usersTyping() {
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing users-typing was requested by unauth connection ${this.connection.id}`);
    return UsersTyping.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;

  Logger.debug('Publishing users-typing', { meetingId, userId });

  return UsersTyping.find({ meetingId });
}

function pubishUsersTyping(...args) {
  const boundUsersTyping = usersTyping.bind(this);
  return boundUsersTyping(...args);
}

LWMeteor.publish('users-typing', pubishUsersTyping);
