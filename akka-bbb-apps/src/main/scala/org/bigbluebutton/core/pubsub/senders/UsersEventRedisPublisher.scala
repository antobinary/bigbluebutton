package org.bigbluebutton.core.pubsub.senders

import org.bigbluebutton.core.MessageSender
import org.bigbluebutton.core.api._
import org.bigbluebutton.common.messages.MessagingConstants
import com.google.gson.Gson
import org.bigbluebutton.common.messages.GetCurrentLayoutReplyMessage
import org.bigbluebutton.common.messages.BroadcastLayoutMessage
import org.bigbluebutton.common.messages.LockLayoutMessage
import org.bigbluebutton.common.messages.{ MuteUserInVoiceConfRequestMessage, EjectUserFromVoiceConfRequestMessage, GetUsersFromVoiceConfRequestMessage }

class UsersEventRedisPublisher(service: MessageSender) extends OutMessageListener2 {

  def handleMessage(msg: IOutMessage) {
    msg match {
      case msg: RecordingStatusChanged => handleRecordingStatusChanged(msg)
      case msg: GetRecordingStatusReply => handleGetRecordingStatusReply(msg)
      case msg: MeetingMuted => handleMeetingMuted(msg)
      case msg: MeetingState => handleMeetingState(msg)
      case msg: MeetingEnded => handleMeetingEnded(msg)
      case msg: MeetingHasEnded => handleMeetingHasEnded(msg)
      case msg: DisconnectAllUsers => handleDisconnectAllUsers(msg)
      case msg: DisconnectUser => handleDisconnectUser(msg)
      case msg: PermissionsSettingInitialized => handlePermissionsSettingInitialized(msg)
      case msg: NewPermissionsSetting => handleNewPermissionsSetting(msg)
      case msg: UserLocked => handleUserLocked(msg)
      case msg: GetPermissionsSettingReply => handleGetPermissionsSettingReply(msg)
      case msg: UserRegistered => handleUserRegistered(msg)
      case msg: UserLeft => handleUserLeft(msg)
      case msg: PresenterAssigned => handlePresenterAssigned(msg)
      case msg: EndAndKickAll => handleEndAndKickAll(msg)
      case msg: GetUsersReply => handleGetUsersReply(msg)
      case msg: ValidateAuthTokenReply => handleValidateAuthTokenReply(msg)
      case msg: ValidateAuthTokenTimedOut => handleValidateAuthTokenTimedOut(msg)
      case msg: UserJoined => handleUserJoined(msg)
      case msg: UserRaisedHand => handleUserRaisedHand(msg)
      case msg: UserLoweredHand => handleUserLoweredHand(msg)
      case msg: UserSharedWebcam => handleUserSharedWebcam(msg)
      case msg: UserUnsharedWebcam => handleUserUnsharedWebcam(msg)
      case msg: UserStatusChange => handleUserStatusChange(msg)
      case msg: UserVoiceMuted => handleUserVoiceMuted(msg)
      case msg: UserVoiceTalking => handleUserVoiceTalking(msg)
      case msg: MuteVoiceUser => handleMuteVoiceUser(msg)
      case msg: EjectVoiceUser => handleEjectVoiceUser(msg)
      case msg: GetUsersInVoiceConference => handleGetUsersFromVoiceConference(msg)
      case msg: UserJoinedVoice => handleUserJoinedVoice(msg)
      case msg: UserLeftVoice => handleUserLeftVoice(msg)
      case msg: IsMeetingMutedReply => handleIsMeetingMutedReply(msg)
      case msg: UserListeningOnly => handleUserListeningOnly(msg)
      case msg: GetCurrentLayoutReply => handleGetCurrentLayoutReply(msg)
      case msg: BroadcastLayoutEvent => handleBroadcastLayoutEvent(msg)
      case msg: LockLayoutEvent => handleLockLayoutEvent(msg)
      case _ => //println("Unhandled message in UsersClientMessageSender")
    }
  }

  private def handleLockLayoutEvent(msg: LockLayoutEvent) {
    val users = new java.util.ArrayList[String];
    msg.applyTo.foreach(uvo => {
      users.add(uvo.userID)
    })

    val evt = new LockLayoutMessage(msg.meetingID, msg.setById, msg.locked, users)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, evt.toJson())
  }

  private def handleBroadcastLayoutEvent(msg: BroadcastLayoutEvent) {
    val users = new java.util.ArrayList[String];
    msg.applyTo.foreach(uvo => {
      users.add(uvo.userID)
    })

    val evt = new BroadcastLayoutMessage(msg.meetingID, msg.setByUserID, msg.layoutID, msg.locked, users)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, evt.toJson())
  }

  private def handleGetCurrentLayoutReply(msg: GetCurrentLayoutReply) {
    val reply = new GetCurrentLayoutReplyMessage(msg.meetingID, msg.requesterID, msg.setByUserID, msg.layoutID, msg.locked)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, reply.toJson())
  }

  private def handleMeetingState(msg: MeetingState) {
    val json = UsersMessageToJsonConverter.meetingState(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleMeetingMuted(msg: MeetingMuted) {
    val json = UsersMessageToJsonConverter.meetingMuted(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleMeetingHasEnded(msg: MeetingHasEnded): Unit = {
    val json = UsersMessageToJsonConverter.meetingHasEnded(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleMeetingEnded(msg: MeetingEnded): Unit = {
    val json = UsersMessageToJsonConverter.meetingEnded(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleDisconnectAllUsers(msg: DisconnectAllUsers) {
    val json = UsersMessageToJsonConverter.disconnectAllUsersToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleDisconnectUser(msg: DisconnectUser) {
    val json = UsersMessageToJsonConverter.disconnectUserToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handlePermissionsSettingInitialized(msg: PermissionsSettingInitialized) {
    val json = UsersMessageToJsonConverter.permissionsSettingInitializedToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleNewPermissionsSetting(msg: NewPermissionsSetting) {
    val json = UsersMessageToJsonConverter.newPermissionsSettingToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleUserLocked(msg: UserLocked) {
    val json = UsersMessageToJsonConverter.userLockedToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleGetPermissionsSettingReply(msg: GetPermissionsSettingReply) {
    val json = UsersMessageToJsonConverter.getPermissionsSettingReplyToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleUserRegistered(msg: UserRegistered) {
    val json = UsersMessageToJsonConverter.userRegisteredToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleUserStatusChange(msg: UserStatusChange) {
    val json = UsersMessageToJsonConverter.userStatusChangeToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleUserRaisedHand(msg: UserRaisedHand) {
    val json = UsersMessageToJsonConverter.userRaisedHandToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleUserLoweredHand(msg: UserLoweredHand) {
    val json = UsersMessageToJsonConverter.userLoweredHandToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleUserSharedWebcam(msg: UserSharedWebcam) {
    val json = UsersMessageToJsonConverter.userSharedWebcamToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleUserUnsharedWebcam(msg: UserUnsharedWebcam) {
    val json = UsersMessageToJsonConverter.userUnsharedWebcamToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleGetUsersReply(msg: GetUsersReply) {
    val json = UsersMessageToJsonConverter.getUsersReplyToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleUserJoinedVoice(msg: UserJoinedVoice) {
    val json = UsersMessageToJsonConverter.userJoinedVoice(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleUserVoiceMuted(msg: UserVoiceMuted) {
    val json = UsersMessageToJsonConverter.userVoiceMuted(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleUserVoiceTalking(msg: UserVoiceTalking) {
    val json = UsersMessageToJsonConverter.userVoiceTalking(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleMuteVoiceUser(msg: MuteVoiceUser) {
    val m = new MuteUserInVoiceConfRequestMessage(msg.meetingID, msg.voiceConfId, msg.voiceUserId, msg.mute)
    service.send(MessagingConstants.TO_VOICE_CONF_SYSTEM_CHAN, m.toJson())
  }

  private def handleGetUsersFromVoiceConference(msg: GetUsersInVoiceConference) {
    val m = new GetUsersFromVoiceConfRequestMessage(msg.meetingID, msg.voiceConfId)
    service.send(MessagingConstants.TO_VOICE_CONF_SYSTEM_CHAN, m.toJson())
  }

  private def handleEjectVoiceUser(msg: EjectVoiceUser) {
    val m = new EjectUserFromVoiceConfRequestMessage(msg.meetingID, msg.voiceConfId, msg.voiceUserId)
    service.send(MessagingConstants.TO_VOICE_CONF_SYSTEM_CHAN, m.toJson())

  }

  private def handleUserLeftVoice(msg: UserLeftVoice) {
    val json = UsersMessageToJsonConverter.userLeftVoiceToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleIsMeetingMutedReply(msg: IsMeetingMutedReply) {
    val json = UsersMessageToJsonConverter.isMeetingMutedReplyToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleRecordingStatusChanged(msg: RecordingStatusChanged) {
    val json = UsersMessageToJsonConverter.recordingStatusChangedToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleGetRecordingStatusReply(msg: GetRecordingStatusReply) {
    val json = UsersMessageToJsonConverter.getRecordingStatusReplyToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleValidateAuthTokenReply(msg: ValidateAuthTokenReply) {
    val json = UsersMessageToJsonConverter.validateAuthTokenReplyToJson(msg)
    println("************** Publishing [" + json + "] *******************")
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleValidateAuthTokenTimedOut(msg: ValidateAuthTokenTimedOut) {
    val json = UsersMessageToJsonConverter.validateAuthTokenTimeoutToJson(msg)
    println("************** Publishing [" + json + "] *******************")
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleUserJoined(msg: UserJoined) {
    val json = UsersMessageToJsonConverter.userJoinedToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleRegisteredUser(msg: UserRegistered) {
    val json = UsersMessageToJsonConverter.userRegisteredToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleUserLeft(msg: UserLeft) {
    val json = UsersMessageToJsonConverter.userLeftToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handlePresenterAssigned(msg: PresenterAssigned) {
    val json = UsersMessageToJsonConverter.presenterAssignedToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleEndAndKickAll(msg: EndAndKickAll) {
    val json = UsersMessageToJsonConverter.endAndKickAllToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleUserListeningOnly(msg: UserListeningOnly) {
    val json = UsersMessageToJsonConverter.userListeningOnlyToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }
}