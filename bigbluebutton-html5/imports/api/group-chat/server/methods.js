import { LWMeteor } from '/imports/startup/lightwire';
import createGroupChat from './methods/createGroupChat';
import destroyGroupChat from './methods/destroyGroupChat';

LWMeteor.methods({
  createGroupChat,
  destroyGroupChat,
});
