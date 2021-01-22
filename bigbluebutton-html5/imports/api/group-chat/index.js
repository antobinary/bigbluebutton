import { Meteor } from 'meteor/meteor';
import { LWMeteor } from '/imports/startup/lightwire';

const GroupChat = new LWMeteor.Collection('group-chat');

if (Meteor.isServer) {
  GroupChat._ensureIndex({
    meetingId: 1, chatId: 1, access: 1, users: 1,
  });
}

export default GroupChat;

const CHAT_ACCESS = {
  PUBLIC: 'PUBLIC_ACCESS',
  PRIVATE: 'PRIVATE_ACCESS',
};

export const CHAT_ACCESS_PUBLIC = CHAT_ACCESS.PUBLIC;
export const CHAT_ACCESS_PRIVATE = CHAT_ACCESS.PRIVATE;
