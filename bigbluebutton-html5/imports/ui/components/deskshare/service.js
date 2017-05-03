import Deskshare from '/imports/api/deskshare';
import DeskshareManager from '/imports/api/deskshare/client/manager';
import Auth from '/imports/ui/services/auth';

let deskshareManager = undefined;

const init = () => {
  const userId = Auth.userID;
  const User = Users.findOne({ userId });
  const username = User.user.name;

  const Meeting = Meetings.findOne(); //TODO test this with Breakouts
  const turns = Meeting.turns;
  const stuns = Meeting.stuns;
  const voiceBridge = Meeting.voiceConf;

  const userData = {
    userId,
    username,
    turns,
    stuns,
    voiceBridge,
  };

  deskshareManager = new DeskshareManager(userData);
};

// when the meeting information has been updated check to see if it was
// desksharing. If it has changed either trigger a call to receive video
// and display it, or end the call and hide the video
function isVideoBroadcasting() {
  const ds = Deskshare.findOne({});
  if (ds == null || !ds.broadcasting) {
    return false;
  }

  return (ds.broadcasting && ds.startedBy != Auth.userID);
}

// if remote deskshare has been ended disconnect and hide the video stream
function presenterDeskshareHasEnded() {
  // references a functiion in the global namespace inside verto_extension.js
  // that we load dynamically
  deskshareManager.vertoExitVideo();
};

// if remote deskshare has been started connect and display the video stream
function presenterDeskshareHasStarted() {
  // references a functiion in the global namespace inside verto_extension.js
  // that we load dynamically
  deskshareManager.vertoWatchVideo();
};

export {
  isVideoBroadcasting, presenterDeskshareHasEnded, presenterDeskshareHasStarted,
};

