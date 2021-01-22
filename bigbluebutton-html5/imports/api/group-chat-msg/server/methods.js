import { LWMeteor } from '/imports/startup/lightwire';
import sendGroupChatMsg from './methods/sendGroupChatMsg';
import clearPublicChatHistory from './methods/clearPublicChatHistory';
import startUserTyping from './methods/startUserTyping';
import stopUserTyping from './methods/stopUserTyping';

LWMeteor.methods({
  sendGroupChatMsg,
  clearPublicChatHistory,
  startUserTyping,
  stopUserTyping,
});
