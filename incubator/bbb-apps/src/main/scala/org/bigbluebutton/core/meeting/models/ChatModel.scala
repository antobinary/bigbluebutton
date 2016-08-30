package org.bigbluebutton.core.meeting.models

import scala.collection.mutable.ArrayBuffer

class ChatModel {
  private val messages = new ArrayBuffer[Map[String, String]]()

  def getChatHistory(): Array[Map[String, String]] = {
    val history = new Array[Map[String, String]](messages.size)
    messages.copyToArray(history)

    history
  }

  def addNewChatMessage(msg: Map[String, String]) {
    messages append msg
  }
}