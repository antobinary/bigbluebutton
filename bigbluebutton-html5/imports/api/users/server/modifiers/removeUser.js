import { check } from 'meteor/check';
import Users from '/imports/api/users';
import VideoStreams from '/imports/api/video-streams';
import Logger from '/imports/startup/server/logger';
import stopWatchingExternalVideo from '/imports/api/external-videos/server/methods/stopWatchingExternalVideo';
import clearUserInfoForRequester from '/imports/api/users-infos/server/modifiers/clearUserInfoForRequester';

export default function removeUser(meetingId, userId) {
  check(meetingId, String);
  check(userId, String);

  // const userToRemove = Users.findOne({ userId, meetingId });
  //
  // if (userToRemove) {
  //   const { presenter } = userToRemove;
  //   if (presenter) {
  //     // TODO future: this should be initiated by BBB
  //     stopWatchingExternalVideo({ meetingId, requesterUserId: userId });
  //   }
  // }

  clearUserInfoForRequester(meetingId, userId);

  const selector = {
    meetingId,
    userId,
  };

  Logger.info(`Removed user id=${userId} meeting=${meetingId}`);

  VideoStreams.remove(selector);
  return Users.remove(selector);
}
