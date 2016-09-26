package org.bigbluebutton.core.user.client.handlers

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.IncomingMsg.JoinMeetingUserInMsg2x
import org.bigbluebutton.core.meeting.models.MeetingStateModel
import org.bigbluebutton.core.user.client.ClientInMsgHdlr

trait UserJoinMeetingMsgHdlr {
  this: ClientInMsgHdlr =>

  val outGW: OutMessageGateway

  def handle(msg: JoinMeetingUserInMsg2x, meeting: MeetingStateModel): Unit = {
    /*
    def becomePresenterIfNeeded(user: User): Unit = {
      // Become presenter if only moderator in meeting
      if (user.isModerator && !UsersModel.hasPresenter(meeting.usersModel.toVector)) {
        val u = user.add(PresenterRole)
        meeting.usersModel.save(u)
        // Send presenter assigned message
        val newPresenter = new Presenter(u.id, u.name, u.id)
        outGW.send(new PresenterAssignedEventOutMsg(msg.body.meetingId, meeting.props.recordingProp.recorded, newPresenter))
      }
    }

    def process(user: User): Unit = {
      meeting.usersModel.save(user)
      outGW.send(new UserJoinedEvent2x(msg.body.meetingId, meeting.props.recordingProp.recorded, user))
      becomePresenterIfNeeded(user)
    }

    UsersModel.findWithId(msg.body.userId, meeting.usersModel.toVector) match {
      case Some(user) =>
        // Find presence associated with this session
        val client = user.findWithClientId(ClientId(msg.body.sessionToken.value))

      // TODO: Send reconnecting message
      case None =>
        for {
          ru <- RegisteredUsersModel.findWithToken(msg.sessionToken, meeting.registeredUsersModel.toVector)
          u = User.create(msg.senderId, ru.extId, ru.name, ru.roles)
          presence = User.create(msg.clientId, u.id, msg.sessionToken, msg.userAgent)
          user = User.add(u, presence)
        } yield process(user)
    }
   */
  }
}
