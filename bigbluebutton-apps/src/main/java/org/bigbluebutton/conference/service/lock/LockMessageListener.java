package org.bigbluebutton.conference.service.lock;

import org.bigbluebutton.conference.service.messaging.redis.MessageHandler;
import org.bigbluebutton.core.api.IBigBlueButtonInGW;
import org.bigbluebutton.red5.pub.messages.GetLockSettingsMessage;
import org.bigbluebutton.red5.pub.messages.LockUserMessage;
import org.bigbluebutton.red5.pub.messages.MessagingConstants;
import org.bigbluebutton.red5.pub.messages.SendLockSettingsMessage;
import com.google.gson.JsonParser;
import com.google.gson.JsonObject;


public class LockMessageListener implements MessageHandler{

	private IBigBlueButtonInGW bbbGW;
	
	public void setBigBlueButtonInGW(IBigBlueButtonInGW bbbGW) {
		this.bbbGW = bbbGW;
	}

	@Override
	public void handleMessage(String pattern, String channel, String message) {
		if (channel.equalsIgnoreCase(MessagingConstants.TO_MEETING_CHANNEL)) {
			JsonParser parser = new JsonParser();
			JsonObject obj = (JsonObject) parser.parse(message);

			if (obj.has("header") && obj.has("payload")) {
				JsonObject header = (JsonObject) obj.get("header");

				if (header.has("name")) {
					String messageName = header.get("name").getAsString();
					if (GetLockSettingsMessage.GET_LOCK_SETTINGS.equals(messageName)) {
						GetLockSettingsMessage msg = GetLockSettingsMessage.fromJson(message);
						bbbGW.getLockSettings(msg.meetingId, msg.userId);
					} else if(LockUserMessage.LOCK_USER.equals(messageName)) {
						LockUserMessage msg = LockUserMessage.fromJson(message);
						bbbGW.lockUser(msg.meetingId, msg.requesterId, msg.lock, msg.internalUserId);
					} else if(SendLockSettingsMessage.SEND_LOCK_SETTINGS.equals(messageName)) {
						SendLockSettingsMessage msg = SendLockSettingsMessage.fromJson(message);
						bbbGW.sendLockSettings(msg.meetingId, msg.userId, msg.newSettings);
					}
				}
			}
		}
	}
}
