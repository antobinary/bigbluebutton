package org.bigbluebutton.red5apps

import akka.actor.ActorSystem
import org.bigbluebutton.bus.{FromClientMsg, PubSubMessageBus, Red5AppsMsg, Red5AppsMsgBus}
import org.bigbluebutton.connections.ConnectionsManager
import org.bigbluebutton.endpoint.redis.{AppsRedisSubscriberActor, RedisMessageReceiver, RedisSenderActor}
import org.bigbluebutton.{IRed5InGW, Red5OutGateway}
import org.bigbluebutton.red5apps.messages.Red5InJsonMsg
import redis.RedisClient

class InGateway(val red5OutGW: Red5OutGateway) extends IRed5InGW with SystemConfiguration {

  println(" ****************** Hello!!!!!!!!!!!!!!!!!")

  implicit val system = ActorSystem("red5-bbb-apps-system")

//  val redisPublisher = new RedisPublisher(system)
//  val redisMsgReceiver = new RedisMessageReceiver()
//  val redisSubscriberActor = system.actorOf(AppsRedisSubscriberActor.props(redisMsgReceiver), "red5-apps-redis-subscriber")

  println("*************** meetingManagerChannel " + meetingManagerChannel + " *******************")

  val red5AppsMsgBus = new Red5AppsMsgBus
  val pubSubMessageBus = new PubSubMessageBus

  val redis = RedisClient(redisHost, redisPort)(system)
  // Set the name of this client to be able to distinguish when doing CLIENT LIST on redis-cli
  redis.clientSetname("Red5AppsAkkaPubSub")

  val connectionsManager = system.actorOf(ConnectionsManager.props(system, red5AppsMsgBus,
    pubSubMessageBus), "red5-apps-connections-manager")

  val redisSenderActor = system.actorOf(RedisSenderActor.props(pubSubMessageBus, redis),
    "red5-apps-redis-sender-actor")

  def handle(msg: Red5InJsonMsg): Unit = {
    println("\n\n InGW:"  + msg.name + " \n\n")

    msg.name match {
      case "ClientConnected" =>
        red5AppsMsgBus.publish(Red5AppsMsg("connection-manager-actor", FromClientMsg(msg.name, msg
          .json, msg.connectionId, msg.sessionToken)))
      case "ClientDisconnected" =>
        red5AppsMsgBus.publish(Red5AppsMsg("connection-manager-actor", FromClientMsg(msg.name, msg
          .json, msg.connectionId, msg.sessionToken)))
      case "ValidateAuthToken" =>
        red5AppsMsgBus.publish(Red5AppsMsg(msg.sessionToken, FromClientMsg(msg.name, msg.json, msg
          .connectionId, msg.sessionToken)))

      // case all other messages =>
      // publish to connection actor
      case _ =>
        red5AppsMsgBus.publish(Red5AppsMsg(msg.sessionToken, FromClientMsg(msg.name, msg.json, msg
          .connectionId, msg.sessionToken)))
    }

  }


}
