package org.bigbluebutton.red5.client;

import java.util.HashMap;
import java.util.Map;

import org.bigbluebutton.conference.meeting.messaging.red5.BroadcastClientMessage;
import org.bigbluebutton.conference.meeting.messaging.red5.ConnectionInvokerService;
import org.bigbluebutton.conference.meeting.messaging.red5.DirectClientMessage;
import org.bigbluebutton.red5.pub.messages.GetPresentationInfoReplyMessage;
import org.bigbluebutton.red5.pubsub.messages.GoToSlideReplyMessage;
import org.bigbluebutton.red5.pubsub.messages.PresentationConversionDoneMessage;
import org.bigbluebutton.red5.pubsub.messages.PresentationConversionErrorMessage;
import org.bigbluebutton.red5.pubsub.messages.PresentationConversionProgressMessage;
import org.bigbluebutton.red5.pubsub.messages.PresentationCursorUpdateMessage;
import org.bigbluebutton.red5.pubsub.messages.PresentationPageGeneratedReplyMessage;
import org.bigbluebutton.red5.pubsub.messages.PresentationPageResizedMessage;
import org.bigbluebutton.red5.sub.messages.GetSlideInfoReplyMessage;
import org.bigbluebutton.red5.sub.messages.PresentationRemovedMessage;
import org.bigbluebutton.red5.pub.messages.Constants;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class PresentationClientMessageSender {
	private ConnectionInvokerService service;
	
	public PresentationClientMessageSender(ConnectionInvokerService service) {
		this.service = service;
	}
	
	public void handlePresentationMessage(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				switch (messageName) {
				  case PresentationRemovedMessage.PRESENTATION_REMOVED:
					  processPresentationRemovedMessage(message);
					  break;
				  case GetPresentationInfoReplyMessage.GET_PRESENTATION_INFO_REPLY:
					  processGetPresentationInfoReplyMessage(message);
					  break;
				  case GoToSlideReplyMessage.GO_TO_SLIDE_REPLY:
					  processGoToSlideMessage(message);
					  break;
				  case PresentationConversionProgressMessage.PRESENTATION_CONVERSION_PROGRESS:
					  processPresentationConversionProgress(message);
					  break;
				  case PresentationPageGeneratedReplyMessage.PRESENTATION_PAGE_GENERATED:
					  processPresentationPageGeneratedReply(message);
					  break;
				  case PresentationCursorUpdateMessage.PRESENTATION_CURSOR_UPDATED:
					  processPresentationCursorUpdate(message);
					  break;
				  case PresentationConversionErrorMessage.PRESENTATION_CONVERSION_ERROR:
					  processPresentationConversionError(message);
					  break;
				  case GetSlideInfoReplyMessage.GET_SLIDE_INFO:
					  processGetSlideInfoReply(message);
					  break;
				  case PresentationConversionDoneMessage.PRESENTATION_CONVERSION_DONE:
					  processPresentationConversionDone(message);
					  break;
				  case PresentationPageResizedMessage.PRESENTATION_PAGE_RESIZED:
					  processPresentationPageResized(message);
					  break;
				}
			}
		}
	}

	private void processPresentationPageResized(String json) {

		PresentationPageResizedMessage msg = PresentationPageResizedMessage.fromJson(json);
		if (msg != null) {
			Map<String, Object> args = new HashMap<String, Object>();

			args.put("id", msg.page.get("id"));
			args.put("num", msg.page.get("num"));
			args.put("current", msg.page.get("current"));
			args.put("swfUri", msg.page.get("swf_uri"));
			args.put("txtUri", msg.page.get("txt_uri"));
			args.put("pngUri", msg.page.get("png_uri"));
			args.put("thumbUri", msg.page.get("thumb_uri"));
			args.put("xOffset", msg.page.get("x_offset"));
			args.put("yOffset", msg.page.get("y_offset"));
			args.put("widthRatio", msg.page.get("width_ratio"));
			args.put("heightRatio", msg.page.get("height_ratio"));

			Map<String, Object> message = new HashMap<String, Object>();
			Gson gson = new Gson();
			message.put("msg", gson.toJson(args));

//			System.out.println("RedisPubSubMessageHandler - processPresentationPageResized \n"
//			+ message.get("msg") + "\n");

			BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "moveCallback", message);
			service.sendMessage(m);
		}
	}

	private void processPresentationConversionDone(String json) {

		PresentationConversionDoneMessage msg = PresentationConversionDoneMessage.fromJson(json);
		if (msg != null) {
			Map<String, Object> args = new HashMap<String, Object>();
			args.put("meetingID", msg.meetingId);
			args.put("code", msg.code);

			Map<String, Object> presentation = new HashMap<String, Object>();
			presentation.put("id", msg.presentation.get("id"));
			presentation.put("name", msg.presentation.get("name"));
			presentation.put("current", msg.presentation.get("current"));
			presentation.put("pages", msg.presentation.get("pages"));

			args.put("presentation", presentation);

			Map<String, Object> message = new HashMap<String, Object>();
			Gson gson = new Gson();
			message.put("msg", gson.toJson(args));

//			System.out.println("RedisPubSubMessageHandler - processPresentationConversionDone \n"
//			+ message.get("msg") + "\n");

			BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "conversionCompletedUpdateMessageCallback", message);
			service.sendMessage(m);
		}
	}

	private void processGetSlideInfoReply(String json) {
		GetSlideInfoReplyMessage msg = GetSlideInfoReplyMessage.fromJson(json);
		if (msg != null) {
			Map<String, Object> args = new HashMap<String, Object>();
			args.put("meetingID", msg.meetingId);
			args.put("xOffset", msg.xOffset);
			args.put("yOffest", msg.yOffset);
			args.put("widthRatio", msg.widthRatio);
			args.put("heightRatio", msg.heightRatio);

			Map<String, Object> message = new HashMap<String, Object>();
			Gson gson = new Gson();
			message.put("msg", gson.toJson(args));

//			System.out.println("RedisPubSubMessageHandler - processGetSlideInfoReply \n"
//			+ message.get("msg") + "\n");

			DirectClientMessage m = new DirectClientMessage(msg.meetingId, msg.requesterId, "getSlideInfoReply", message);
			service.sendMessage(m);
		}
	}

	private void processPresentationConversionError(String json) {

	}

	private void processPresentationCursorUpdate(String json) {
		PresentationCursorUpdateMessage msg = PresentationCursorUpdateMessage.fromJson(json);
		if (msg != null) {
			Map<String, Object> args = new HashMap<String, Object>();
			args.put("meetingID", msg.meetingId);
			args.put("xPercent", msg.xPercent);
			args.put("yPercent", msg.yPercent);

			Map<String, Object> message = new HashMap<String, Object>();
			Gson gson = new Gson();
			message.put("msg", gson.toJson(args));

//			System.out.println("RedisPubSubMessageHandler - processPresentationConversionProgress \n"
//			+ message.get("msg") + "\n");

			BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "PresentationCursorUpdateCommand", message);
			service.sendMessage(m);
		}
	}

	private void processPresentationPageGeneratedReply(String json) {
		PresentationPageGeneratedReplyMessage msg = PresentationPageGeneratedReplyMessage.fromJson(json);
		if (msg != null) {
			Map<String, Object> args = new HashMap<String, Object>();
			args.put("presentationID", msg.presentationId);
			args.put("meetingID", msg.meetingId);
			args.put("code", msg.code);
			args.put("messageKey", msg.messageKey);
			args.put("presentationName", msg.presentationName);
			args.put("pagesCompleted", msg.pagesCompleted);
			args.put("numberOfPages", msg.numPages);

			Map<String, Object> message = new HashMap<String, Object>();
			Gson gson = new Gson();
			message.put("msg", gson.toJson(args));

//			System.out.println("RedisPubSubMessageHandler - processPresentationConversionProgress \n"
//			+ message.get("msg") + "\n");

			BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "generatedSlideUpdateMessageCallback", message);
			service.sendMessage(m);
		}
	}

	private void processPresentationConversionProgress(String json) {
		PresentationConversionProgressMessage msg = PresentationConversionProgressMessage.fromJson(json);
		if (msg != null) {
			Map<String, Object> args = new HashMap<String, Object>();
			args.put("presentationID", msg.presentationId);
			args.put("meetingID", msg.meetingId);
			args.put("code", msg.code);
			args.put("messageKey", msg.messageKey);
			args.put("presentationName", msg.presentationName);

			Map<String, Object> message = new HashMap<String, Object>();
			Gson gson = new Gson();
			message.put("msg", gson.toJson(args));

//			System.out.println("RedisPubSubMessageHandler - processPresentationConversionProgress \n"
//			+ message.get("msg") + "\n");

			BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "conversionUpdateMessageCallback", message);
			service.sendMessage(m);
		}
	}

	private void processPresentationRemovedMessage(String json) {
		PresentationRemovedMessage msg = PresentationRemovedMessage.fromJson(json);
		if (msg != null) {
			Map<String, Object> args = new HashMap<String, Object>(); 
			args.put("presentationID", msg.presentationId);

			Map<String, Object> message = new HashMap<String, Object>();
			Gson gson = new Gson();
			message.put("msg", gson.toJson(args));

//			System.out.println("RedisPubSubMessageHandler - processPresentationRemovedMessage \n" +
//			message.get("msg") + "\n");

			BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "removePresentationCallback", message);
			service.sendMessage(m);
		}
	}

	private void processGetPresentationInfoReplyMessage(String json) {
		GetPresentationInfoReplyMessage msg = GetPresentationInfoReplyMessage.fromJson(json);
		if (msg != null) {
			Map<String, Object> args = new HashMap<String, Object>();
			args.put("meetingID", msg.meetingId);
			args.put("presenter", msg.presenter);
			args.put("presentations", msg.presentations);

			Map<String, Object> message = new HashMap<String, Object>();
			Gson gson = new Gson();
			message.put("msg", gson.toJson(args));

//			System.out.println("RedisPubSubMessageHandler - processGetPresentationInfoReplyMessage \n" +
//			message.get("msg") + "\n");

			DirectClientMessage m = new DirectClientMessage(msg.meetingId, msg.requesterId, "getPresentationInfoReply", message);
			service.sendMessage(m);
		}
	}

	private void processGoToSlideMessage(String json) {
		GoToSlideReplyMessage msg = GoToSlideReplyMessage.fromJson(json);
		if (msg != null) {
			Map<String, Object> args = new HashMap<String, Object>();
			args.put("id", msg.page.get(Constants.ID));
			args.put("widthRatio", msg.page.get(Constants.WIDTH_RATIO));
			args.put("yOffset", msg.page.get(Constants.Y_OFFSET));
			args.put("xOffset", msg.page.get(Constants.X_OFFSET));
			args.put("num", msg.page.get("num"));
			args.put("heightRatio", msg.page.get(Constants.HEIGHT_RATIO));
			args.put("pngUri", msg.page.get("png_uri"));
			args.put("thumbUri", msg.page.get("thumb_uri"));
			args.put(Constants.CURRENT, msg.page.get(Constants.CURRENT));
			args.put("txtUri", msg.page.get("txt_uri"));
			args.put("swfUri", msg.page.get("swf_uri"));

			Map<String, Object> message = new HashMap<String, Object>();
			Gson gson = new Gson();
			message.put("msg", gson.toJson(args));

//			System.out.println("RedisPubSubMessageHandler - processGoToSlideMessage \n"
//			+ message.get("msg") + "\n");

			BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "goToSlideCallback", message);
			service.sendMessage(m);
		}
	}

}
