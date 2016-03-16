package org.bigbluebutton.app.screenshare;

public interface IScreenShareApplication {
  
  IsScreenSharingResponse isScreenSharing(String meetingId);
  ScreenShareInfoResponse getScreenShareInfo(String meetingId, String token);
  StartShareRequestResponse startShareRequest(String meetingId, String userId, Boolean record);
  void stopShareRequest(String meetingId, String streamId);
  void streamStarted(String meetingId, String streamId, String url);
  void streamStopped(String meetingId, String streamId);
  void sharingStarted(String meetingId, String streamId, Integer width, Integer height);
  void sharingStopped(String meetingId, String streamId);
  void updateShareStatus(String meetingId, String streamId, Integer seqNum);
  Boolean isSharingStopped(String meetingId, String streamId); 
  Boolean recordStream(String meetingId, String streamId);
  void userDisconnected(String meetingId, String userId);
}
