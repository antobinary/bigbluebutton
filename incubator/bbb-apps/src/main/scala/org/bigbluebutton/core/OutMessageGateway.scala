package org.bigbluebutton.core

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.core.bus.OutgoingEventBus
import org.bigbluebutton.core.bus.BigBlueButtonOutMessage
import org.bigbluebutton.core.api.IOutMessage

object OutMessageGateway {
  def apply(outgoingEventBus: OutgoingEventBus) =
    new OutMessageGateway(outgoingEventBus)
}

class OutMessageGateway(outgoingEventBus: OutgoingEventBus) extends SystemConfiguration {

  def send(msg: IOutMessage) {
    outgoingEventBus.publish(BigBlueButtonOutMessage(outgoingMessageChannel, msg))
  }
}