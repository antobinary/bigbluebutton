import VertoDeskshareBridge from '../bridge/verto';

export default class DeskshareManager {
  constructor(userData) {
    const MEDIA_CONFIG = Meteor.settings.public.media;
    const mediaBridge = MEDIA_CONFIG.useSIPAudio ? undefined : new VertoDeskshareBridge(userData);
    if (!(mediaBridge instanceof VertoDeskshareBridge)) {
      throw 'Media Bridge not compatible';
    }

    this.bridge = mediaBridge;
  }

  watchVideo () {
    this.bridge.vertoWatchVideo();
  }

  exitVideo() {
    this.bridge.vertoExitVideo();
  }

}
