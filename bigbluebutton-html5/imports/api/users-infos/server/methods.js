import { LWMeteor } from '/imports/startup/lightwire';
import requestUserInformation from './methods/requestUserInformation';
import removeUserInformation from './methods/removeUserInformation';

LWMeteor.methods({
  requestUserInformation,
  removeUserInformation,
});
