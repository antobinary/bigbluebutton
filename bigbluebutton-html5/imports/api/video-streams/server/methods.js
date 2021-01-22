import { LWMeteor } from '/imports/startup/lightwire';
import userShareWebcam from './methods/userShareWebcam';
import userUnshareWebcam from './methods/userUnshareWebcam';

LWMeteor.methods({
  userShareWebcam,
  userUnshareWebcam,
});
