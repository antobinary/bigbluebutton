import { LWMeteor } from '/imports/startup/lightwire';
import createBreakoutRoom from '/imports/api/breakouts/server/methods/createBreakout';
import requestJoinURL from './methods/requestJoinURL';
import endAllBreakouts from './methods/endAllBreakouts';

LWMeteor.methods({
  requestJoinURL,
  createBreakoutRoom,
  endAllBreakouts,
});
