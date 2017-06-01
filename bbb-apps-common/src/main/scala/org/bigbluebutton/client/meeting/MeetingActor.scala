package org.bigbluebutton.client.meeting

import akka.actor.{Actor, ActorLogging, Props}
import org.bigbluebutton.client.bus._
import org.bigbluebutton.common2.messages.{BbbCommonEnvJsNodeMsg}

object MeetingActor {
  def props(meetingId: String, msgToAkkaAppsEventBus: MsgToAkkaAppsEventBus,
            msgToClientEventBus: MsgToClientEventBus): Props =
  Props(classOf[MeetingActor], meetingId, msgToAkkaAppsEventBus, msgToClientEventBus)
}

class MeetingActor(val meetingId: String, msgToAkkaAppsEventBus: MsgToAkkaAppsEventBus,
                   msgToClientEventBus: MsgToClientEventBus) extends Actor with ActorLogging {

  private val userMgr = new UsersManager

  def receive = {
    case msg: ConnectMsg => handleConnectMsg(msg)
    case msg: DisconnectMsg => handleDisconnectMsg(msg)
    case msg: MsgFromClientMsg => handleMsgFromClientMsg(msg)
    case msg: BbbCommonEnvJsNodeMsg => handleBbbServerMsg(msg)
      // TODO: Should keep track of user lifecycle so we can remove when user leaves the meeting.
  }

  private def createUser(id: String): User = {
    User(id, msgToAkkaAppsEventBus, meetingId, msgToClientEventBus)
  }

  def handleConnectMsg(msg: ConnectMsg): Unit = {
    println("**** MeetingActor handleConnectMsg " + msg.connInfo.meetingId)
    UsersManager.findWithId(userMgr, msg.connInfo.userId) match {
      case Some(m) => m.actorRef forward(msg)
      case None =>
        val m = createUser(msg.connInfo.userId)
        UsersManager.add(userMgr, m)
        m.actorRef forward(msg)
    }
  }

  def handleDisconnectMsg(msg: DisconnectMsg): Unit = {
    println("**** MeetingActor handleDisconnectMsg " + msg.connInfo.meetingId)
    for {
      m <- UsersManager.findWithId(userMgr, msg.connInfo.userId)
    } yield {
      m.actorRef forward(msg)
    }
  }

  def handleMsgFromClientMsg(msg: MsgFromClientMsg):Unit = {
    println("**** MeetingActor handleMsgFromClient " + msg.json)
    for {
      m <- UsersManager.findWithId(userMgr, msg.connInfo.userId)
    } yield {
      m.actorRef forward(msg)
    }
  }

  def handleBbbServerMsg(msg: BbbCommonEnvJsNodeMsg): Unit = {
    println("**** MeetingActor handleBbbServerMsg " + msg.envelope.name)
    for {
      msgType <- msg.envelope.routing.get("msgType")
    } yield {
      handleServerMsg(msgType, msg)
    }
  }

  def handleServerMsg(msgType: String, msg: BbbCommonEnvJsNodeMsg): Unit = {
    println("**** MeetingActor handleServerMsg " + msg.envelope.name)
    msgType match {
      case "direct" => handleDirectMessage(msg)
      case "broadcast" => handleBroadcastMessage(msg)
      case "system" => handleSystemMessage(msg)
    }
  }

  private def forwardToUser(msg: BbbCommonEnvJsNodeMsg): Unit = {
    println("**** MeetingActor forwardToUser " + msg.envelope.name)
    for {
      userId <- msg.envelope.routing.get("userId")
      m <- UsersManager.findWithId(userMgr, userId)
    } yield {
      println("**** MeetingActor forwardToUser " + m.userId)
      m.actorRef forward(msg)
    }
  }

  def handleDirectMessage(msg: BbbCommonEnvJsNodeMsg): Unit = {
    println("**** MeetingActor handleDirectMessage " + msg.envelope.name)
    // In case we want to handle specific messages. We can do it here.
    forwardToUser(msg)
  }

  def handleBroadcastMessage(msg: BbbCommonEnvJsNodeMsg): Unit = {
    // In case we want to handle specific messages. We can do it here.
    forwardToUser(msg)
  }

  def handleSystemMessage(msg: BbbCommonEnvJsNodeMsg): Unit = {
    // In case we want to handle specific messages. We can do it here.
    forwardToUser(msg)
  }
}
