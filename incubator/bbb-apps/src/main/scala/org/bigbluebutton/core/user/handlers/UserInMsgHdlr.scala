package org.bigbluebutton.core.user.handlers

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.IncomingMsg._
import org.bigbluebutton.core.domain.{ RegisteredUser, User, UserState }
import org.bigbluebutton.core.meeting.models.MeetingStateModel
import org.bigbluebutton.core.user.UsersModel

class UserInMsgHdlr(
  val user: RegisteredUser,
  val outGW: OutMessageGateway)
    extends SystemConfiguration
    with ValidateAuthTokenMsgHdlr
    with UserJoinMeetingMsgHdlr {

  val userState: UserState = new UserState(user)

}
