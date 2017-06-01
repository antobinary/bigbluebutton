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
package org.bigbluebutton.modules.whiteboard.services
{
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.core.managers.ConnectionManager;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardDrawEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardAccessEvent;

	public class MessageSender
	{	
		private static const LOGGER:ILogger = getClassLogger(MessageSender);

		public function modifyAccess(e:WhiteboardAccessEvent):void {
//			LogUtil.debug("Sending [whiteboard.enableWhiteboard] to server.");
			var message:Object = new Object();
			message["multiUser"] = e.multiUser;
			
			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage("whiteboard.modifyWhiteboardAccess", 
				function(result:String):void { // On successful result
				},	                   
				function(status:String):void { // status - On error occurred
					LOGGER.error(status); 
				},
				message
			);
		}
		
		public function getWhiteboardAccess():void {
			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage("whiteboard.getWhiteboardAccess", 
				function(result:String):void { // On successful result
				},
				function(status:String):void { // status - On error occurred
					LOGGER.error(status); 
				}
			);
		}
		
		/**
		 * Sends a call out to the red5 server to notify the clients to toggle grid mode
		 * 
		 */		
		public function toggleGrid():void{
//			LogUtil.debug("Sending [whiteboard.toggleGrid] to server.");
			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage("whiteboard.toggleGrid", 
				function(result:String):void { // On successful result
				},	                   
				function(status:String):void { // status - On error occurred
					LOGGER.error(status); 
				}
			);
		}
		
		/**
		 * Sends a call out to the red5 server to notify the clients to undo a GraphicObject
		 * 
		 */		
		public function undoGraphic(wbId:String):void{
	        var msg:Object = new Object();
	        msg["whiteboardId"] = wbId;

			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage("whiteboard.undo", 
				function(result:String):void { // On successful result
				},	                   
				function(status:String):void { // status - On error occurred
					LOGGER.error(status); 
				},
        msg
			);
		}
		
		/**
		 * Sends a call out to the red5 server to notify the clients that the board needs to be cleared 
		 * 
		 */		
		public function clearBoard(wbId:String):void{
	        var msg:Object = new Object();
	        msg["whiteboardId"] = wbId;
      
			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage("whiteboard.clear", 
				function(result:String):void { // On successful result
				},	                   
				function(status:String):void { // status - On error occurred
					LOGGER.error(status); 
				},
        msg
			);
		}

    public function requestAnnotationHistory(wbId:String):void{
            var msg:Object = new Object();
            msg["whiteboardId"] = wbId;
            
            var _nc:ConnectionManager = BBB.initConnectionManager();
            _nc.sendMessage("whiteboard.requestAnnotationHistory", 
                function(result:String):void { // On successful result
                },	                   
                function(status:String):void { // status - On error occurred
					LOGGER.error(status); 
                },
                msg
            );
        }

		/**
		 * Sends a shape to the Shared Object on the red5 server, and then triggers an update across all clients
		 * @param shape The shape sent to the SharedObject
		 * 
		 */		
		public function sendShape(e:WhiteboardDrawEvent):void {
            			
			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage("whiteboard.sendAnnotation",               
					function(result:String):void { // On successful result
//						LogUtil.debug(result); 
					},	                   
					function(status:String):void { // status - On error occurred
						LOGGER.error(status); 
					},
					e.annotation.annotation
			);
		}
		
		/**
		 * Send an event to the server to update the user's cursor position
		 * @param xPercent
		 * @param yPercent
		 * 
		 */
		public function sendCursorPosition(xPercent:Number, yPercent:Number):void {
			var message:Object = new Object();
			message["xPercent"] = xPercent;
			message["yPercent"] = yPercent;
			
			var _nc:ConnectionManager = BBB.initConnectionManager();
			_nc.sendMessage("whiteboard.sendCursorPosition", 
				function(result:String):void { // On successful result
					//LOGGER.debug(result); 
				},
				function(status:String):void { // status - On error occurred
					LOGGER.error(status); 
				},
				message
			);
		}
	}
}
