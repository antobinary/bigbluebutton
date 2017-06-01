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
package org.bigbluebutton.modules.sharednotes.services
{
  import flash.events.IEventDispatcher;
  import flash.events.TimerEvent;
  import flash.utils.Timer;

  import mx.collections.ArrayCollection;

  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.main.model.users.IMessageListener;
  import org.bigbluebutton.modules.sharednotes.events.CurrentDocumentEvent;
  import org.bigbluebutton.modules.sharednotes.events.SharedNotesEvent;
  import org.bigbluebutton.modules.sharednotes.events.ReceivePatchEvent;

  public class MessageReceiver implements IMessageListener {
    private static const LOGGER:ILogger = getClassLogger(MessageReceiver);

    private var buffering:Boolean = true;
    private var patchDocumentBuffer:ArrayCollection = new ArrayCollection();
    private var bufferingTimeout:Timer = new Timer(5000, 1);
    private var bufferReader:Timer = new Timer(1000, 1);
    public var dispatcher:IEventDispatcher;

    public function MessageReceiver()
    {
      BBB.initConnectionManager().addMessageListener(this);
      bufferingTimeout.addEventListener(TimerEvent.TIMER, endBuffering);
      bufferReader.addEventListener(TimerEvent.TIMER, consumeBuffer);
    }

    public function onMessage(messageName:String, message:Object):void
    {
      switch (messageName) {
        case "PatchDocumentCommand":
          if (buffering || patchDocumentBuffer.length != 0) {
            patchDocumentBuffer.addItem(message);
            if (!bufferReader.running) {
              bufferReader.start();
            }
          } else {
            handlePatchDocumentCommand(message);
          }
          break;
        case "GetCurrentDocumentCommand":
          handleGetCurrentDocumentCommand(message);
          bufferingTimeout.start();
          break;
        case "CreateAdditionalNotesCommand":
          handleCreateAdditionalNotesCommand(message);
          break;
        case "DestroyAdditionalNotesCommand":
          handleDestroyAdditionalNotesCommand(message);
          break;
        case "SharedNotesSyncNoteCommand":
          handleSharedNotesSyncNoteCommand(message);
          break;
        default:
           break;
      }
    }

    private function endBuffering(e:TimerEvent):void {
      buffering = false;
    }

    private function consumeBuffer(e:TimerEvent):void {
      while (patchDocumentBuffer.length > 0) {
        handlePatchDocumentCommand(patchDocumentBuffer.removeItemAt(0));
      }
    }

    private function handlePatchDocumentCommand(msg: Object):void {
      LOGGER.debug("Handling patch document message [" + msg.msg + "]");
      var map:Object = JSON.parse(msg.msg);

      var receivePatchEvent:ReceivePatchEvent = new ReceivePatchEvent();
      if (map.userID != UsersUtil.getMyUserID()) {
        receivePatchEvent.patch = map.patch;
      } else {
        receivePatchEvent.patch = "";
      }
      receivePatchEvent.noteId = map.noteID;
      receivePatchEvent.patchId = map.patchID;
      receivePatchEvent.undo = map.undo;
      receivePatchEvent.redo = map.redo;

      dispatcher.dispatchEvent(receivePatchEvent);
    }

    private function handleGetCurrentDocumentCommand(msg: Object):void {
      LOGGER.debug("Handling get current document message [" + msg.msg + "]");
      var map:Object = JSON.parse(msg.msg);

      var currentDocumentEvent:CurrentDocumentEvent = new CurrentDocumentEvent();
      currentDocumentEvent.document = map.notes;
      dispatcher.dispatchEvent(currentDocumentEvent);
    }

    private function handleCreateAdditionalNotesCommand(msg: Object):void {
      LOGGER.debug("Handling create additional notes message [" + msg.msg + "]");
      var map:Object = JSON.parse(msg.msg);

      var e:SharedNotesEvent = new SharedNotesEvent(SharedNotesEvent.CREATE_ADDITIONAL_NOTES_REPLY_EVENT);
      e.payload.notesId = map.noteID;
      e.payload.noteName = map.noteName;
      dispatcher.dispatchEvent(e);
    }

    private function handleDestroyAdditionalNotesCommand(msg: Object):void {
      LOGGER.debug("Handling destroy additional notes message [" + msg.msg + "]");
      var map:Object = JSON.parse(msg.msg);

      var e:SharedNotesEvent = new SharedNotesEvent(SharedNotesEvent.DESTROY_ADDITIONAL_NOTES_REPLY_EVENT);
      e.payload.notesId = map.noteID;
      dispatcher.dispatchEvent(e);
    }

    private function handleSharedNotesSyncNoteCommand(msg: Object):void {
      LOGGER.debug("Handling sharednotes sync note message [" + msg.msg + "]");
      var map:Object = JSON.parse(msg.msg);

      var e:SharedNotesEvent = new SharedNotesEvent(SharedNotesEvent.SYNC_NOTE_REPLY_EVENT);
      e.payload.noteId = map.noteID;
      e.payload.note = map.note;
      dispatcher.dispatchEvent(e);
    }
  }
}
