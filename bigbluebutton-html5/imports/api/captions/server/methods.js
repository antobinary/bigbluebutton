import { LWMeteor } from '/imports/startup/lightwire';
import takeOwnership from '/imports/api/captions/server/methods/takeOwnership';
import appendText from '/imports/api/captions/server/methods/appendText';

LWMeteor.methods({
  takeOwnership,
  appendText,
});
