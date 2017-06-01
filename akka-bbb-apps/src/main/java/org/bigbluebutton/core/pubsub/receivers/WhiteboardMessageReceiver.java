
package org.bigbluebutton.core.pubsub.receivers;


import org.bigbluebutton.common.messages.ClearWhiteboardRequestMessage;
import org.bigbluebutton.common.messages.ModifyWhiteboardAccessRequestMessage;
import org.bigbluebutton.common.messages.GetWhiteboardAccessRequestMessage;
import org.bigbluebutton.common.messages.MessagingConstants;
import org.bigbluebutton.common.messages.RequestWhiteboardAnnotationHistoryRequestMessage;
import org.bigbluebutton.common.messages.SendCursorPositionMessage;
import org.bigbluebutton.common.messages.SendWhiteboardAnnotationRequestMessage;
import org.bigbluebutton.common.messages.UndoWhiteboardRequest;
import org.bigbluebutton.core.api.IBigBlueButtonInGW;

import com.google.gson.JsonParser;
import com.google.gson.JsonObject;

public class WhiteboardMessageReceiver implements MessageHandler {
	
	private IBigBlueButtonInGW bbbInGW;
	
	public WhiteboardMessageReceiver(IBigBlueButtonInGW bbbInGW) {
		this.bbbInGW = bbbInGW;
	}

	@Override
	public void handleMessage(String pattern, String channel, String message) {
		if (channel.equalsIgnoreCase(MessagingConstants.TO_WHITEBOARD_CHANNEL)) {

			JsonParser parser = new JsonParser();
			JsonObject obj = (JsonObject) parser.parse(message);

			if (obj.has("header") && obj.has("payload")) {
				JsonObject header = (JsonObject) obj.get("header");

				if (header.has("name")) {
					String messageName = header.get("name").getAsString();
					if (UndoWhiteboardRequest.UNDO_WHITEBOARD_REQUEST.equals(messageName)) {
						UndoWhiteboardRequest msg = UndoWhiteboardRequest.fromJson(message);
						bbbInGW.undoWhiteboard(msg.meetingId, msg.requesterId, msg.whiteboardId);
					} else if (ClearWhiteboardRequestMessage.CLEAR_WHITEBOARD_REQUEST.equals(messageName)) {
						ClearWhiteboardRequestMessage msg = ClearWhiteboardRequestMessage.fromJson(message);
						bbbInGW.clearWhiteboard(msg.meetingId, msg.requesterId, msg.whiteboardId);
					} else if (RequestWhiteboardAnnotationHistoryRequestMessage.REQUEST_WHITEBOARD_ANNOTATION_HISTORY_REQUEST.equals(messageName)) {
						RequestWhiteboardAnnotationHistoryRequestMessage msg = RequestWhiteboardAnnotationHistoryRequestMessage.fromJson(message);
						bbbInGW.requestWhiteboardAnnotationHistory(msg.meetingId, msg.requesterId, msg.whiteboardId, msg.replyTo);
					} else if (GetWhiteboardAccessRequestMessage.GET_WHITEBOARD_ACCESS_REQUEST.equals(messageName)) {
						GetWhiteboardAccessRequestMessage msg = GetWhiteboardAccessRequestMessage.fromJson(message);
						bbbInGW.getWhiteboardAccess(msg.meetingId, msg.requesterId);
					} else if (ModifyWhiteboardAccessRequestMessage.MODIFY_WHITEBOARD_ACCESS_REQUEST.equals(messageName)) {
						ModifyWhiteboardAccessRequestMessage msg = ModifyWhiteboardAccessRequestMessage.fromJson(message);
						bbbInGW.modifyWhiteboardAccess(msg.meetingId, msg.requesterId, msg.multiUser);
					} else if (SendWhiteboardAnnotationRequestMessage.SEND_WHITEBOARD_ANNOTATION_REQUEST.equals(messageName)) {
						SendWhiteboardAnnotationRequestMessage msg = SendWhiteboardAnnotationRequestMessage.fromJson(message);
						bbbInGW.sendWhiteboardAnnotation(msg.meetingId, msg.requesterId, msg.annotation);
					} else if (SendCursorPositionMessage.SEND_CURSOR_POSITION.equals(messageName)) {
						SendCursorPositionMessage msg = SendCursorPositionMessage.fromJson(message);
						bbbInGW.sendCursorPosition(msg.meetingId, msg.requesterId, msg.xPercent, msg.yPercent);
					}
				}
			}
		}
	}
}
