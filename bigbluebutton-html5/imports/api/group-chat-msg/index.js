import { Meteor } from 'meteor/meteor';
import { LWMeteor } from '/imports/startup/lightwire';

const GroupChatMsg = new LWMeteor.Collection('group-chat-msg');
const UsersTyping = new LWMeteor.Collection('users-typing');

if (Meteor.isServer) {
  GroupChatMsg._ensureIndex({ meetingId: 1, chatId: 1 });
  UsersTyping._ensureIndex({ meetingId: 1, isTypingTo: 1 });
}

export { GroupChatMsg, UsersTyping };
