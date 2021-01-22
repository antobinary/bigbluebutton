import { LWMeteor } from '/imports/startup/lightwire';
import removePresentation from './methods/removePresentation';
import setPresentation from './methods/setPresentation';
import setPresentationDownloadable from './methods/setPresentationDownloadable';

LWMeteor.methods({
  removePresentation,
  setPresentation,
  setPresentationDownloadable,
});
