package org.bigbluebutton.core

import org.bigbluebutton.common2.domain._

import org.bigbluebutton.core.api.GuestPolicy
import org.bigbluebutton.core.apps._
import org.bigbluebutton.core.models.{ RegisteredUsers, Users }

trait AppsTestFixtures {

  val meetingId = "testMeetingId"
  val externalMeetingId = "testExternalMeetingId"
  val parentMeetingId = "testParentMeetingId"
  val sequence = 4
  val meetingName = "test meeting"
  val record = false
  val voiceConfId = "85115"
  val deskshareConfId = "85115-DESKSHARE"
  val durationInMinutes = 10
  val autoStartRecording = false
  val allowStartStopRecording = false
  val webcamsOnlyForModerator = false;
  val moderatorPassword = "modpass"
  val viewerPassword = "viewpass"
  val createTime = System.currentTimeMillis
  val createDate = "Oct 26, 2015"
  val isBreakout = false
  val welcomeMsgTemplate = "Welcome message template"
  val welcomeMsg = "Welcome message"
  val modOnlyMessage = "Moderator only message"
  val dialNumber = "613-555-1234"
  val maxUsers = 25
  val guestPolicy = "ALWAYS_ASK"

  val red5DeskShareIP = "127.0.0.1"
  val red5DeskShareApp = "red5App"
  val metadata: collection.immutable.Map[String, String] = Map("foo" -> "bar", "bar" -> "baz", "baz" -> "foo")

  val mProps = new MeetingProperties(meetingId, externalMeetingId, parentMeetingId,
    meetingName, record,
    voiceConfId, deskshareConfId,
    durationInMinutes,
    autoStartRecording, allowStartStopRecording, webcamsOnlyForModerator,
    moderatorPassword, viewerPassword,
    createTime, createDate, red5DeskShareIP, red5DeskShareApp,
    isBreakout, sequence, metadata, GuestPolicy.ALWAYS_ACCEPT)

  val chatModel = new ChatModel()
  val layoutModel = new LayoutModel()
  val meetingModel = new MeetingModel()
  val usersModel = new UsersModel()
  val pollModel = new PollModel()
  val wbModel = new WhiteboardModel()
  val presModel = new PresentationModel()
  val breakoutModel = new BreakoutRoomModel()
  val captionModel = new CaptionModel()
  val notesModel = new SharedNotesModel()
  val users = new Users
  val registeredUsers = new RegisteredUsers

  meetingModel.setGuestPolicy(mProps.guestPolicy)

  val meetingProp = MeetingProp(name = meetingName, extId = externalMeetingId, intId = meetingId,
    isBreakout = isBreakout.booleanValue())
  val durationProps = DurationProps(duration = durationInMinutes, createdTime = createTime)
  val password = PasswordProp(moderatorPass = moderatorPassword, viewerPass = viewerPassword)
  val recordProp = RecordProp(record = record, autoStartRecording = autoStartRecording,
    allowStartStopRecording = allowStartStopRecording)
  val welcomeProp = WelcomeProp(welcomeMsgTemplate = welcomeMsgTemplate, welcomeMsg = welcomeMsg,
    modOnlyMessage = modOnlyMessage)
  val voiceProp = VoiceProp(telVoice = voiceConfId, webVoice = voiceConfId, dialNumber = dialNumber)
  val usersProp = UsersProp(maxUsers = maxUsers, webcamsOnlyForModerator = webcamsOnlyForModerator,
    guestPolicy = guestPolicy)
  val metadataProp = new MetadataProp(metadata)

  val defaultProps = DefaultProps(meetingProp, durationProps, password, recordProp, welcomeProp, voiceProp,
    usersProp, metadataProp)

}
