package org.bigbluebutton.core.api.json.handlers.presentation

import org.bigbluebutton.core.api.IncomingMsg.GetPageInfoEventInMessage
import org.bigbluebutton.core.api.RedisMsgHdlrActor
import org.bigbluebutton.core.domain.{ IntMeetingId, IntUserId }
import org.bigbluebutton.core.api.json.{ BigBlueButtonInMessage, IncomingEventBus2x, ReceivedJsonMessage }
import org.bigbluebutton.core.api.json.handlers.UnhandledJsonMsgHdlr
import org.bigbluebutton.messages.presentation.GetPageInfoEventMessage

trait GetPageInfoEventJsonMsgHdlr extends UnhandledJsonMsgHdlr {
  this: RedisMsgHdlrActor =>

  val eventBus: IncomingEventBus2x

  override def handleReceivedJsonMsg(msg: ReceivedJsonMessage): Unit = {
    def publish(meetingId: IntMeetingId, senderId: IntUserId, pageId: String): Unit = {
      log.debug(s"Publishing ${msg.name} [ $pageId $senderId]")
      eventBus.publish(
        BigBlueButtonInMessage(meetingId.value,
          new GetPageInfoEventInMessage(meetingId, senderId, pageId)))
    }

    if (msg.name == GetPageInfoEventMessage.NAME) {
      log.debug("Received JSON message [" + msg.name + "]")
      val m = GetPageInfoEventMessage.fromJson(msg.data)
      for {
        meetingId <- Option(m.header.meetingId)
        senderId <- Option(m.header.senderId)
        pageId <- Option(m.body.pageId)
      } yield publish(IntMeetingId(meetingId), IntUserId(senderId), pageId)
    } else {
      super.handleReceivedJsonMsg(msg)
    }

  }
}
