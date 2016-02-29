package org.bigbluebutton.core.handlers

import org.bigbluebutton.core.api._
import scala.collection.mutable.ArrayBuffer
import org.bigbluebutton.core.MeetingActor
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.LiveMeeting

trait CaptionHandler {
  this: LiveMeeting =>

  val outGW: OutMessageGateway

  def handleSendCaptionHistoryRequest(msg: SendCaptionHistoryRequest) {
    var history = captionModel.getHistory()

    outGW.send(new SendCaptionHistoryReply(mProps.id.value, mProps.recorded.value, msg.requesterID, history))
  }

  def handleUpdateCaptionOwnerRequest(msg: UpdateCaptionOwnerRequest) {
    // clear owner from previous locale
    if (msg.ownerID.length > 0) {
      captionModel.findLocaleByOwnerId(msg.ownerID).foreach(t => {
        captionModel.changeTranscriptOwner(t, "")

        // send notification that owner has changed
        outGW.send(new UpdateCaptionOwnerReply(mProps.id.value, mProps.recorded.value, t, ""))
      })
    }
    // create the locale if it doesn't exist
    if (captionModel.transcripts contains msg.locale) {
      captionModel.changeTranscriptOwner(msg.locale, msg.ownerID)
    } else { // change the owner if it does exist
      captionModel.newTranscript(msg.locale, msg.ownerID)
    }

    outGW.send(new UpdateCaptionOwnerReply(mProps.id.value, mProps.recorded.value, msg.locale, msg.ownerID))
  }

  def handleEditCaptionHistoryRequest(msg: EditCaptionHistoryRequest) {
    captionModel.findLocaleByOwnerId(msg.userID).foreach(t => {
      if (t == msg.locale) {
        captionModel.editHistory(msg.startIndex, msg.endIndex, msg.locale, msg.text)

        outGW.send(new EditCaptionHistoryReply(mProps.id.value, mProps.recorded.value, msg.userID, msg.startIndex, msg.endIndex, msg.locale, msg.text))
      }
    })
  }

  def checkCaptionOwnerLogOut(userId: String) {
    captionModel.findLocaleByOwnerId(userId).foreach(t => {
      captionModel.changeTranscriptOwner(t, "")

      // send notification that owner has changed
      outGW.send(new UpdateCaptionOwnerReply(mProps.id.value, mProps.recorded.value, t, ""))
    })
  }
}