package org.bigbluebutton.core.api.json.handlers.presentation

import org.bigbluebutton.core.api.IncomingMsg.PresentationPageGeneratedEventInMessage
import org.bigbluebutton.core.api.RedisMsgHdlrActor
import org.bigbluebutton.core.apps.presentation.domain.PresentationId
import org.bigbluebutton.core.domain.IntMeetingId
import org.bigbluebutton.core.api.json.{ BigBlueButtonInMessage, IncomingEventBus2x, ReceivedJsonMessage }
import org.bigbluebutton.core.api.json.handlers.UnhandledJsonMsgHdlr
import org.bigbluebutton.messages.presentation.PresentationPageGeneratedEventMessage

trait PresentationPageGeneratedEventJsonMsgHdlr extends UnhandledJsonMsgHdlr {
  this: RedisMsgHdlrActor =>

  val eventBus: IncomingEventBus2x

  override def handleReceivedJsonMsg(msg: ReceivedJsonMessage): Unit = {
    def publish(meetingId: IntMeetingId, messageKey: String, code: String, presentationId: PresentationId, numberOfPages: Int, pagesCompleted: Int): Unit = {
      log.debug(s"Publishing ${msg.name} [ $presentationId $code]")
      eventBus.publish(
        BigBlueButtonInMessage(meetingId.value,
          new PresentationPageGeneratedEventInMessage(meetingId, messageKey, code,
            presentationId, numberOfPages, pagesCompleted)))
    }

    if (msg.name == PresentationPageGeneratedEventMessage.NAME) {
      log.debug("Received JSON message [" + msg.name + "]")
      val m = PresentationPageGeneratedEventMessage.fromJson(msg.data)
      for {
        meetingId <- Option(m.header.meetingId)
        messageKey <- Option(m.body.messageKey)
        code <- Option(m.body.code)
        presentationId <- Option(m.body.presentationId)
        numberOfPages <- Option(m.body.numberOfPages)
        pagesCompleted <- Option(m.body.pagesCompleted)
      } yield publish(IntMeetingId(meetingId), messageKey, code, PresentationId(presentationId),
        numberOfPages, pagesCompleted)
    } else {
      super.handleReceivedJsonMsg(msg)
    }

  }
}
