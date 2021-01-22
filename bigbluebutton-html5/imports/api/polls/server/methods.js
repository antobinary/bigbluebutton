import { LWMeteor } from '/imports/startup/lightwire';
import publishVote from './methods/publishVote';
import publishPoll from './methods/publishPoll';
import startPoll from './methods/startPoll';
import stopPoll from './methods/stopPoll';

LWMeteor.methods({
  publishVote,
  publishPoll,
  startPoll,
  stopPoll,
});
