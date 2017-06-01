package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._

import scala.collection.mutable.ArrayBuffer
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.{ Roles, UserVO, Users }
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.MeetingStatus2x

trait LayoutApp {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleGetCurrentLayoutRequest(msg: GetCurrentLayoutRequest) {
    outGW.send(new GetCurrentLayoutReply(msg.meetingID, props.recordProp.record, msg.requesterID,
      liveMeeting.layoutModel.getCurrentLayout(),
      MeetingStatus2x.getPermissions(liveMeeting.status).lockedLayout,
      liveMeeting.layoutModel.getLayoutSetter()))
  }

  def handleLockLayoutRequest(msg: LockLayoutRequest) {
    liveMeeting.layoutModel.applyToViewersOnly(msg.viewersOnly)
    liveMeeting.lockLayout(msg.lock)

    outGW.send(new LockLayoutEvent(msg.meetingID, props.recordProp.record, msg.setById, msg.lock, affectedUsers))

    msg.layout foreach { l =>
      liveMeeting.layoutModel.setCurrentLayout(l)
      broadcastSyncLayout(msg.meetingID, msg.setById)
    }
  }

  private def broadcastSyncLayout(meetingId: String, setById: String) {
    outGW.send(new BroadcastLayoutEvent(meetingId, props.recordProp.record, setById,
      liveMeeting.layoutModel.getCurrentLayout(),
      MeetingStatus2x.getPermissions(liveMeeting.status).lockedLayout,
      liveMeeting.layoutModel.getLayoutSetter(), affectedUsers))
  }

  def handleBroadcastLayoutRequest(msg: BroadcastLayoutRequest) {
    liveMeeting.layoutModel.setCurrentLayout(msg.layout)
    broadcastSyncLayout(msg.meetingID, msg.requesterID)
  }

  def handleLockLayout(lock: Boolean, setById: String) {
    outGW.send(new LockLayoutEvent(props.meetingProp.intId, props.recordProp.record, setById, lock, affectedUsers))

    broadcastSyncLayout(props.meetingProp.intId, setById)
  }

  def affectedUsers(): Array[UserVO] = {
    if (liveMeeting.layoutModel.doesLayoutApplyToViewersOnly()) {
      val au = ArrayBuffer[UserVO]()
      Users.getUsers(liveMeeting.users) foreach { u =>
        if (!u.presenter && u.role != Roles.MODERATOR_ROLE) {
          au += u
        }
      }
      au.toArray
    } else {
      Users.getUsers(liveMeeting.users).toArray
    }

  }

}
