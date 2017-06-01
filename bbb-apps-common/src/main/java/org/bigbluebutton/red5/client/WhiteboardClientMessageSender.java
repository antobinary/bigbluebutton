package org.bigbluebutton.red5.client;

import java.util.HashMap;
import java.util.Map;

import org.bigbluebutton.common.messages.ClearWhiteboardReplyMessage;
import org.bigbluebutton.common.messages.CursorPositionUpdatedMessage;
import org.bigbluebutton.common.messages.GetWhiteboardShapesReplyMessage;
import org.bigbluebutton.common.messages.GetWhiteboardAccessReplyMessage;
import org.bigbluebutton.common.messages.SendWhiteboardAnnotationReplyMessage;
import org.bigbluebutton.common.messages.UndoWhiteboardReplyMessage;
import org.bigbluebutton.common.messages.ModifiedWhiteboardAccessMessage;
import org.bigbluebutton.red5.client.messaging.BroadcastClientMessage;
import org.bigbluebutton.red5.client.messaging.IConnectionInvokerService;
import org.bigbluebutton.red5.client.messaging.DirectClientMessage;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class WhiteboardClientMessageSender {
	private IConnectionInvokerService service;
	
	public WhiteboardClientMessageSender(IConnectionInvokerService service) {
		this.service = service;
	}
	
	public void handleWhiteboardMessage(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
	
				switch (messageName) {
					case UndoWhiteboardReplyMessage.UNDO_WHITEBOARD_REPLY:
						UndoWhiteboardReplyMessage uwrm = UndoWhiteboardReplyMessage.fromJson(message);
						if (uwrm != null) {
							processUndoWhiteboardReply(uwrm);
						}
						break;
					case ClearWhiteboardReplyMessage.WHITEBOARD_CLEARED_MESSAGE:
						ClearWhiteboardReplyMessage wcm = ClearWhiteboardReplyMessage.fromJson(message);
						if (wcm != null) {
							processClearWhiteboardReply(wcm);
						}
						break;
					case GetWhiteboardShapesReplyMessage.GET_WHITEBOARD_SHAPES_REPLY:
						GetWhiteboardShapesReplyMessage gwsrm = GetWhiteboardShapesReplyMessage.fromJson(message);
						if (gwsrm != null) {
							processGetWhiteboardShapesReplyMessage(gwsrm);
						}
						break;
					case SendWhiteboardAnnotationReplyMessage.SEND_WHITEBOARD_ANNOTATION_REPLY:
						SendWhiteboardAnnotationReplyMessage swarm = SendWhiteboardAnnotationReplyMessage.fromJson(message);
						if (swarm != null) {
							processSendWhiteboardAnnotationReplyMessage(swarm);
						}
						break;
					case CursorPositionUpdatedMessage.CURSOR_POSITION_UPDATED:
						CursorPositionUpdatedMessage cpum = CursorPositionUpdatedMessage.fromJson(message);
						if (cpum != null) {
							processCursorPositionUpdatedMessage(cpum);
						}
						break;
					case ModifiedWhiteboardAccessMessage.MODIFIED_WHITEBOARD_ACCESS:
						ModifiedWhiteboardAccessMessage mwam = ModifiedWhiteboardAccessMessage.fromJson(message);
						if (mwam != null) {
							processModifiedWhiteboardAccessMessage(mwam);
						}
						break;
					case GetWhiteboardAccessReplyMessage.GET_WHITEBOARD_ACCESS_REPLY:
						GetWhiteboardAccessReplyMessage gwa = GetWhiteboardAccessReplyMessage.fromJson(message);
						if (gwa != null) {
							processGetWhiteboardAccessReply(gwa);
						}
						break;
				}
			}
		}
	}

	private void processSendWhiteboardAnnotationReplyMessage(SendWhiteboardAnnotationReplyMessage msg) {

		Map<String, Object> args = new HashMap<String, Object>();
		args.put("whiteboardId", msg.whiteboardId);
		
		Map<String, Object> shape = new HashMap<String, Object>();

		shape.put("id", msg.shape.get("id"));
		shape.put("type", msg.shape.get("type"));
		shape.put("status", msg.shape.get("status"));
		shape.put("userId", msg.shape.get("userId"));
		shape.put("shape", msg.shape.get("shapes"));
		
		args.put("shape", shape);

		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));

		//broadcast message
		BroadcastClientMessage b = new BroadcastClientMessage(msg.meetingId, "WhiteboardNewAnnotationCommand", message);
		service.sendMessage(b);
		
	}
	
	private void processCursorPositionUpdatedMessage(CursorPositionUpdatedMessage msg) {
		Map<String, Object> args = new HashMap<String, Object>();
		args.put("requesterId", msg.requesterId);
		args.put("xPercent", msg.xPercent);
		args.put("yPercent", msg.yPercent);

		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));

		BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "WhiteboardCursorPositionUpdatedCommand", message);
		service.sendMessage(m);
	}

	private void processGetWhiteboardShapesReplyMessage(GetWhiteboardShapesReplyMessage msg) {

		Map<String, Object> args = new HashMap<String, Object>();
		args.put("whiteboardId", msg.whiteboardId);
		args.put("count", msg.shapes.size());

		args.put("annotations",msg.shapes);
		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));

		DirectClientMessage m = new DirectClientMessage(msg.meetingId, msg.requesterId, "WhiteboardRequestAnnotationHistoryReply", message);
		service.sendMessage(m);
	}

	private void processClearWhiteboardReply(ClearWhiteboardReplyMessage msg) {
		Map<String, Object> args = new HashMap<String, Object>();	
		args.put("whiteboardId", msg.whiteboardId);
		args.put("userId", msg.requesterId);
		args.put("fullClear", msg.fullClear);

		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));

		BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "WhiteboardClearCommand", message);
		service.sendMessage(m);
	}

	private void processUndoWhiteboardReply(UndoWhiteboardReplyMessage msg) {
		Map<String, Object> args = new HashMap<String, Object>();	
		args.put("shapeId", msg.shapeId);
		args.put("whiteboardId", msg.whiteboardId);

		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));

		BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "WhiteboardUndoCommand", message);
		service.sendMessage(m);
	}
	
	private void processModifiedWhiteboardAccessMessage(ModifiedWhiteboardAccessMessage msg) {
		Map<String, Object> args = new HashMap<String, Object>();	
		args.put("multiUser", msg.multiUser);

		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));

		// broadcast message
		BroadcastClientMessage b = new BroadcastClientMessage(msg.meetingId, "WhiteboardAccessModifiedCommand", message);
		service.sendMessage(b);
	}
  
  	private void processGetWhiteboardAccessReply(GetWhiteboardAccessReplyMessage msg) {
		Map<String, Object> args = new HashMap<String, Object>();	
		args.put("multiUser", msg.multiUser);

		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));

		DirectClientMessage m = new DirectClientMessage(msg.meetingId, msg.requesterId, "WhiteboardGetWhiteboardAccessReply", message);
		service.sendMessage(m);
	}
}
