/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 *
 */
package org.bigbluebutton.modules.screenshare.services
{
  import com.asfusion.mate.events.Dispatcher; 
  import org.bigbluebutton.modules.screenshare.events.IsSharingScreenEvent;
  import org.bigbluebutton.modules.screenshare.events.ShareStartRequestResponseEvent;
  import org.bigbluebutton.modules.screenshare.events.ShareStartedEvent;
  import org.bigbluebutton.modules.screenshare.events.ShareStoppedEvent;
  import org.bigbluebutton.modules.screenshare.events.StreamStartedEvent;
  import org.bigbluebutton.modules.screenshare.events.StreamStoppedEvent;
  import org.bigbluebutton.modules.screenshare.services.red5.Connection;
  import org.bigbluebutton.modules.screenshare.services.red5.IMessageListener;
  
  public class MessageReceiver implements IMessageListener
  {
    private static const LOG:String = "SC::MessageReceiver - ";
    private var conn: Connection;
    private var dispatcher:Dispatcher = new Dispatcher();
    
    public function MessageReceiver(conn: Connection) {
      this.conn = conn;
      this.conn.addMessageListener(this);
    }

    public function onMessage(messageName:String, message:Object):void {
      trace(LOG + " Received message " + messageName);

      switch (messageName) {
        case "isSharingScreenRequestResponse":
          handleIsSharingScreenRequestResponse(message);
          break;
        case "startShareRequestResponse":
          handleStartShareRequestResponse(message);
          break;
        case "screenShareStartedMessage":
          handleScreenShareStartedMessage(message);
          break;
        case "screenShareStoppedMessage":
          handleScreenShareStoppedMessage(message);
          break; 
        case "screenStreamStartedMessage":
          handleScreenStreamStartedMessage(message);
          break; 
        case "screenStreamStoppedMessage":
          handleScreenStreamStoppedMessage(message);
          break; 
        default:
//          LogUtil.warn("Cannot handle message [" + messageName + "]");
      }
    }

    private function handleStartShareRequestResponse(message:Object):void {
      trace(LOG + "handleStartShareRequestResponse " + message);      
      var map:Object = JSON.parse(message.msg);      
      if (map.hasOwnProperty("authToken") && map.hasOwnProperty("jnlp")) {
        var shareSuccessEvent: ShareStartRequestResponseEvent = new ShareStartRequestResponseEvent(map.authToken, map.jnlp, true);
        dispatcher.dispatchEvent(shareSuccessEvent); 
      } else {
        var shareFailedEvent: ShareStartRequestResponseEvent = new ShareStartRequestResponseEvent(null, null, false);
        dispatcher.dispatchEvent(shareFailedEvent);         
      }
    }

    private function handleScreenShareStartedMessage(message:Object):void {
      trace(LOG + "handleScreenShareStartedMessage " + message);      
      var map:Object = JSON.parse(message.msg);      
      if (map.hasOwnProperty("streamId")) {
        var streamEvent: ShareStartedEvent = new ShareStartedEvent(map.streamId);
        dispatcher.dispatchEvent(streamEvent); 
      }
    }

    private function handleScreenShareStoppedMessage(message:Object):void {
      trace(LOG + "handleScreenShareStoppedMessage " + message);      
      var map:Object = JSON.parse(message.msg);      
      if (map.hasOwnProperty("streamId")) {
        var streamEvent: ShareStoppedEvent = new ShareStoppedEvent(map.streamId);
        dispatcher.dispatchEvent(streamEvent); 
      }
    }
    
    private function handleScreenStreamStartedMessage(message:Object):void {
      trace(LOG + "handleScreenStreamStartedMessage " + message);      
      var map:Object = JSON.parse(message.msg);      
      if (map.hasOwnProperty("streamId") && map.hasOwnProperty("width") &&
        map.hasOwnProperty("height") && map.hasOwnProperty("url")) {
        var streamEvent: StreamStartedEvent = new StreamStartedEvent(map.streamId, map.width,
            map.height, map.url);
        dispatcher.dispatchEvent(streamEvent); 
      }
    }
    
    private function handleScreenStreamStoppedMessage(message:Object):void {
      trace(LOG + "handleScreenStreamStoppedMessage " + message);      
      var map:Object = JSON.parse(message.msg);      
      if (map.hasOwnProperty("streamId")) {
        var streamEvent: StreamStoppedEvent = new StreamStoppedEvent(map.streamId);
        dispatcher.dispatchEvent(streamEvent); 
      }
    }
    
    private function handleIsSharingScreenRequestResponse(message:Object):void {
      trace(LOG + "handleIsSharingScreenRequestResponse " + message);
      var map:Object = JSON.parse(message.msg);
      if (map.hasOwnProperty("sharing") && map.sharing) {
        if (map.hasOwnProperty("streamId") && map.hasOwnProperty("width") &&
          map.hasOwnProperty("height") && map.hasOwnProperty("url")) {
//          var shareEvent: IsSharingScreenEvent = new IsSharingScreenEvent(map.streamId, map.width,
//            map.height, map.url);
//          dispatcher.dispatchEvent(shareEvent); 
          var streamEvent: StreamStartedEvent = new StreamStartedEvent(map.streamId, map.width,
            map.height, map.url);
          dispatcher.dispatchEvent(streamEvent); 
        }
      }
    }
  }
}