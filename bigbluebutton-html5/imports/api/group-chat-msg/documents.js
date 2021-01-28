import { Document, Types } from '/imports/api/lightwire/lightwire';

export class GroupChatMsgSenderProps extends Document {
  constructor() {
    super();

    this.id = 'fake';
    this.name = 'fake';
  }

  get schema() {
    return {
      id: Types.CacheString,
      name: Types.CacheString,
    };
  }
}

export class GroupChatMsgCollection extends Document {
  constructor() {
    super();
    this._collection = 'group-chat-msg';
    this._id = 0;

    this.id = 'fake';
    this.timestamp = 0;
    this.correlationId = 'fake';
    this.sender = null; // {"id":"w_mzy6qhyfjbjw","name":"Anton"}
    this.color = 'fake';
    this.message = 'fake message';
    this.meetingId = 'asdf';
    this.chatId = 'fakeChadId';
  }

  get schema() {
    return {
      _id: Types.UInt,
      id: Types.String,
      timestamp: Types.Date,
      correlationId: Types.CacheString,
      sender: GroupChatMsgSenderProps,
      color: Types.CacheString,
      message: Types.String,
      meetingId: Types.CacheString,
      chatId: Types.CacheString,
    };
  }
}
