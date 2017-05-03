export default class VertoDeskshareBridge {
  constructor(userData) {
    const {
      username,
      voiceBridge,
    } = userData;

    this.voiceBridge = voiceBridge;
    this.vertoUsername = 'FreeSWITCH User - ' + encodeURIComponent(username);
  }

  vertoWatchVideo() {
    window.vertoWatchVideo(
      'deskshareVideo',
      this.voiceBridge,
      this.vertoUsername,
      null,
      null,
      null,
    );
  }

  vertoExitVideo() {
    console.log('not implemented yet');
  }
}
