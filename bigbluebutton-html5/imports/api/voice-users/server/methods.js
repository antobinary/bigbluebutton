import { LWMeteor } from '/imports/startup/lightwire';
import muteToggle from './methods/muteToggle';
import muteAllToggle from './methods/muteAllToggle';
import muteAllExceptPresenterToggle from './methods/muteAllExceptPresenterToggle';
import ejectUserFromVoice from './methods/ejectUserFromVoice';

LWMeteor.methods({
  toggleVoice: muteToggle,
  muteAllUsers: muteAllToggle,
  muteAllExceptPresenter: muteAllExceptPresenterToggle,
  ejectUserFromVoice,
});
