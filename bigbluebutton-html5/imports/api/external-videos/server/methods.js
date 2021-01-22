import { LWMeteor } from '/imports/startup/lightwire';
import startWatchingExternalVideo from './methods/startWatchingExternalVideo';
import stopWatchingExternalVideo from './methods/stopWatchingExternalVideo';
import initializeExternalVideo from './methods/initializeExternalVideo';
import emitExternalVideoEvent from './methods/emitExternalVideoEvent';

LWMeteor.methods({
  initializeExternalVideo,
  startWatchingExternalVideo,
  stopWatchingExternalVideo,
  emitExternalVideoEvent,
});
