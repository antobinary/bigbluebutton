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

package org.bigbluebutton.modules.screenshare.services.red5
{
	import com.asfusion.mate.events.Dispatcher;
	import flash.events.NetStatusEvent;
	import flash.events.SecurityErrorEvent;
	import flash.events.TimerEvent;
	import flash.net.NetConnection;
	import flash.net.ObjectEncoding;
	import flash.net.Responder;
	import flash.net.SharedObject;
	import flash.utils.Timer;
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.modules.screenshare.events.AppletStartedEvent;
	import org.bigbluebutton.modules.screenshare.events.CursorEvent;
	import org.bigbluebutton.modules.screenshare.events.ViewStreamEvent;

	
	public class Connection {
    private static const LOGGER:ILogger = getClassLogger(Connection);
    public static const LOG:String = "Screenshare::Connection - ";
    
		private var netConn:NetConnection;
		private var uri:String;
    private const connectionTimeout:int = 5000;
    private var retryTimer:Timer = null;
    private var retryCount:int = 0;
    private const MAX_RETRIES:int = 5;
    private var deskSO:SharedObject;
    private var responder:Responder;
    private var width:Number;
    private var height:Number;
    private var meetingId:String;
    
    private var dispatcher:Dispatcher = new Dispatcher();    
    private var _messageListeners:Array = new Array();
    
    public function Connection(meetingId:String) {
      this.meetingId = meetingId;
    }
    
		public function connect(retry:Boolean = false):void {
      netConn = new NetConnection();
			netConn.proxyType = "best";
      netConn.objectEncoding = ObjectEncoding.AMF0;
      netConn.client = this;
      
      netConn.addEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
      netConn.addEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorHandler);
      
			if (getURI().length == 0){
				trace(LOG + "please provide a valid URI connection string. URI Connection String missing");
				return;
			} else if (netConn.connected){
				trace(LOG + "You are already connected to " + getURI());
				return;
			}
      
      trace(LOG + "Trying to connect to [" + getURI() + "] retry=[" + retry + "]");
      if (! (retryCount > 0)) {
        var ce:ConnectionEvent = new ConnectionEvent(ConnectionEvent.CONNECTING);
        dispatcher.dispatchEvent(ce);        
      }
   
			netConn.connect(getURI());
      
      if (!retry) {
        retryTimer = new Timer(connectionTimeout, 1);
        retryTimer.addEventListener(TimerEvent.TIMER_COMPLETE, connectTimeoutHandler);
        retryTimer.start();
      }
		}
		
    public function addMessageListener(listener:IMessageListener):void {
      _messageListeners.push(listener);
    }
    
    public function removeMessageListener(listener:IMessageListener):void {
      for (var ob:int=0; ob<_messageListeners.length; ob++) {
        if (_messageListeners[ob] == listener) {
          _messageListeners.splice (ob,1);
          break;
        }
      }
    }
    
    private function notifyListeners(messageName:String, message:Object):void {
      if (messageName != null && messageName != "") {
        for (var notify:String in _messageListeners) {
          _messageListeners[notify].onMessage(messageName, message);
        }                
      } else {
        trace( LOG + "Message name is undefined");
      }
    }  
    
    public function onMessageFromServer(messageName:String, msg:Object):void {
      trace(LOG + "Got message from server [" + messageName + "] data=" + msg.msg); 
      notifyListeners(messageName, msg);   
    }
    
    private function connectTimeoutHandler(e:TimerEvent):void {
      trace(LOG + "Connection attempt to [" + getURI() + "] timedout. Retrying.");
      retryTimer.stop();
      retryTimer = null;
      
      netConn.close();
      netConn = null;
      
      var ce:ConnectionEvent;
      
      retryCount++;
      if (retryCount < MAX_RETRIES) {
        ce = new ConnectionEvent(ConnectionEvent.CONNECTING_RETRY);
        ce.retryAttempts = retryCount;
        dispatcher.dispatchEvent(ce);
        
        connect(false);
      } else {
        ce = new ConnectionEvent(ConnectionEvent.CONNECTING_MAX_RETRY);
        dispatcher.dispatchEvent(ce);
      }
      
    }
       
		public function close():void{
			netConn.close();
		}
		
    public function isScreenSharing(meetingId: String):void {
      var message:Object = new Object();
      message["meetingId"] = meetingId;
      
      sendMessage("screenshare.isScreenSharing", 
        function(result:String):void { // On successful result
          LOGGER.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
          LOGGER.error(status); 
        },
        message
      );      
    }
    
    private function sendMessage(service:String, onSuccess:Function, onFailure:Function, message:Object=null):void {
      trace(LOG + "SENDING [" + service + "]");
      var responder:Responder =	new Responder(                    
        function(result:Object):void { // On successful result
          onSuccess("Successfully sent [" + service + "]."); 
        },	                   
        function(status:Object):void { // status - On error occurred
          var errorReason:String = "Failed to send [" + service + "]:\n"; 
          for (var x:Object in status) { 
            errorReason += "\t" + x + " : " + status[x]; 
          } 
        }
      );
      
      if (message == null) {
        netConn.call(service, responder);			
      } else {
        netConn.call(service, responder, message);
      }
    }
    
    public function startShareRequest(meetingId: String, userId: String, record: Boolean):void {
      var message:Object = new Object();
      message["meetingId"] = meetingId;
      message["userId"] = userId;
			message["record"] = record;
			
      sendMessage("screenshare.startShareRequest", 
        function(result:String):void { // On successful result
          LOGGER.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
          LOGGER.error(status); 
        },
        message
      );       
    }
    
    public function stopShareRequest(meetingId: String, streamId: String):void {
      var message:Object = new Object();
      message["meetingId"] = meetingId;
      message["streamId"] = streamId;
      
      sendMessage("screenshare.stopShareRequest", 
        function(result:String):void { // On successful result
          LOGGER.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
          LOGGER.error(status); 
        },
        message
      );         
    }

    
		public function setURI(p_URI:String):void{
			uri = p_URI;
		}
		
		public function getURI():String{
			return uri + "/" + UsersUtil.getInternalMeetingID();
		}
		
		public function onBWCheck(... rest):Number { 
			return 0; 
		} 
		
		public function onBWDone(... rest):void { 
			var p_bw:Number; 
			if (rest.length > 0) p_bw = rest[0]; 
			// your application should do something here 
			// when the bandwidth check is complete 
			trace("bandwidth = " + p_bw + " Kbps."); 
		}
		
    private function sendUserIdToServer():void {
      var message:Object = new Object();
      message["meetingId"] = meetingId;
      message["userId"] = UsersUtil.getMyUserID();
      
      sendMessage("screenshare.setUserId", 
        function(result:String):void { // On successful result
          LOGGER.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
          LOGGER.error(status); 
        },
        message
      );       
    }
    
		private function netStatusHandler(event:NetStatusEvent):void {	
      trace(LOG + "Connected to [" + getURI() + "]. [" + event.info.code + "]");
      
      if (retryTimer) {
        retryCount = 0;
        trace(LOG + "Cancelling retry timer.");
        retryTimer.stop();
        retryTimer = null;
      }
      
			
      var ce:ConnectionEvent;
			switch(event.info.code){
				case "NetConnection.Connect.Failed":
          ce = new ConnectionEvent(ConnectionEvent.FAILED);        
          dispatcher.dispatchEvent(ce);
				break;
				
				case "NetConnection.Connect.Success":
          sendUserIdToServer();
          ce = new ConnectionEvent(ConnectionEvent.SUCCESS);
          dispatcher.dispatchEvent(ce);
				break;
				
				case "NetConnection.Connect.Rejected":
          ce = new ConnectionEvent(ConnectionEvent.REJECTED);
          dispatcher.dispatchEvent(ce);
				break;
				
				case "NetConnection.Connect.Closed":
          trace(LOG + "Screenshare connection closed.");
          ce = new ConnectionEvent(ConnectionEvent.CLOSED);
				break;
				
				case "NetConnection.Connect.InvalidApp":
          ce = new ConnectionEvent(ConnectionEvent.INVALIDAPP);
          dispatcher.dispatchEvent(ce);
				break;
				
				case "NetConnection.Connect.AppShutdown":
          ce = new ConnectionEvent(ConnectionEvent.APPSHUTDOWN);
          dispatcher.dispatchEvent(ce);
				break;
				
				case "NetConnection.Connect.NetworkChange":
          trace(LOG + "Detected network change. User might be on a wireless and temporarily dropped connection. Doing nothing. Just making a note.");
					break;
					
				default :
					// I dispatch DISCONNECTED incase someone just simply wants to know if we're not connected'
					// rather than having to subscribe to the events individually
          ce = new ConnectionEvent(ConnectionEvent.DISCONNECTED);
          dispatcher.dispatchEvent(ce);
					break;
			}
		}
		
		private function securityErrorHandler(event:SecurityErrorEvent):void{
      var ce:ConnectionEvent = new ConnectionEvent(ConnectionEvent.SECURITYERROR);
      dispatcher.dispatchEvent(ce);
		}
    
    public function mouseLocationCallback(x:Number, y:Number):void {
      var event:CursorEvent = new CursorEvent(CursorEvent.UPDATE_CURSOR_LOC_EVENT);
      event.x = x;
      event.y = y;
      dispatcher.dispatchEvent(event);
    }
      
    public function disconnect():void{
      if (netConn != null) netConn.close();
    }
        
    public function getConnection():NetConnection{
      return netConn;
    }
    
    public function connectionFailedHandler(e:ConnectionEvent):void{
      LOGGER.error("connection failed to " + uri + " with message " + e.toString());
      trace(LOG + "connection failed to " + uri + " with message " + e.toString());
    }
    
    public function connectionRejectedHandler(e:ConnectionEvent):void{
      LOGGER.error("connection rejected " + uri + " with message " + e.toString());
      trace(LOG + "connection rejected " + uri + " with message " + e.toString());
    }
    
    
    /**
     * Invoked on the server once the clients' applet has started sharing and the server has started a video stream 
     * 
     */		
    public function appletStarted(videoWidth:Number, videoHeight:Number):void{
      trace(LOG + "Got applet started");
      var event:AppletStartedEvent = new AppletStartedEvent();
      event.videoWidth = videoWidth;
      event.videoHeight = videoHeight;
      dispatcher.dispatchEvent(event);
    }
    
    /**
     * Call this method to send out a room-wide notification to start viewing the stream 
     * 
     */		
    public function sendStartViewingNotification(captureWidth:Number, captureHeight:Number):void{
      try{
        deskSO.send("startViewing", captureWidth, captureHeight);
      } catch(e:Error){
        LOGGER.error("error while trying to send start viewing notification");
      }
    }
    
    public function sendStartedViewingNotification(stream:String):void{
      trace(LOG + "Sending start viewing to server");
      netConn.call("deskshare.startedToViewStream", null, stream);
    }
    
    public function stopSharingDesktop(meetingId: String, stream: String):void {
      netConn.call("deskshare.stopSharingDesktop", null, meetingId);
    }
    
    /**
     * Called by the server when a notification is received to start viewing the broadcast stream .
     * This method is called on successful execution of sendStartViewingNotification()
     * 
     */		
    public function startViewing(videoWidth:Number, videoHeight:Number):void{
      trace(LOG + "startViewing invoked by server");
      
      var event:ViewStreamEvent = new ViewStreamEvent(ViewStreamEvent.START);
      dispatcher.dispatchEvent(event);
    }
    
    /**
     * Sends a notification through the server to all the participants in the room to stop viewing the stream 
     * 
     */		
    public function sendStopViewingNotification():void{
      trace(LOG + "Sending stop viewing notification to other clients.");
      try{
        deskSO.send("stopViewing");
      } catch(e:Error){
        trace(LOG + "could not send stop viewing notification");
      }
    }
    
    /**
     * Called by the server to notify clients that the deskshare stream has stooped.
     */
    public function deskshareStreamStopped():void {
      stopViewing();
    }
    
    /**
     * Sends a notification to the module to stop viewing the stream 
     * This method is called on successful execution of sendStopViewingNotification()
     * 
     */		
    public function stopViewing():void{
      trace(LOG + "Received dekskshareStreamStopped");
      dispatcher.dispatchEvent(new ViewStreamEvent(ViewStreamEvent.STOP));
    }
    
    
	}
}
