import { LWMeteor } from '/imports/startup/lightwire';
import requestPresentationUploadToken from './methods/requestPresentationUploadToken';
import setUsedToken from './methods/setUsedToken';

LWMeteor.methods({
  requestPresentationUploadToken,
  setUsedToken,
});
