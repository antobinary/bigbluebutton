import { Document, Types } from '/imports/api/lightwire/lightwire';
import { MethodDocument } from '/imports/api/lightwire/meteor-documents';

export class UserBreakoutProps extends Document {
  constructor(){
    super();

    this.parentId = null;
    this.isBreakoutUser = false;
  }

  get schema(){return {parentId: Types.CacheString, isBreakoutUser: Types.Boolean}};
}

export class UserCollection extends Document {
  constructor(){
    super();
    this._collection = "users";
    this._id = 0;

    this.meetingId = "asdf";
    this.userId = "asdf";
    this.authToken = "fakefakefake";
    this.clientType = "HTML5";
    this.validated = true;
    this.connectionId = "1000000";
    this.approved = true;
    this.loginTime = 0;
    this.inactivityCheck = false;
    this.role = "VIEWER";
    this.name = "asdf";
    this.emoji = "none";
    this.extId = "asdf";
    this.color = "#5e35b1";
    this.intId = "asdf";
    this.guest = true;
    this.authed = false;
    this.locked = true;
    this.avatar = "some.url/avatar.png";
    this.sortName = "asdf";
    this.loggedOut = false;
    this.presenter = false;
    this.guestStatus = "ALLOW";
    this.responseDelay = 0;
    this.breakoutProps = null; //":{"parentId":"bbb-none";"isBreakoutUser = false};
    this.connectionStatus = "online";
    this.effectiveConnectionType = null;
    this.lastPing = 0;
  }

  get schema(){return {
    _id: Types.UInt,
    meetingId: Types.CacheString,
    userId: Types.CacheString,
    authToken: Types.String,
    clientType: Types.CacheString,
    validated: Types.Boolean,
    // connectionId: Types.String, // --nope
    approved: Types.Boolean,
    loginTime: Types.Date,
    inactivityCheck: Types.Boolean,
    role: Types.CacheString,
    name: Types.CacheString,
    emoji: Types.CacheString,
    extId: Types.CacheString,
    color: Types.CacheString,
    intId: Types.CacheString,
    guest: Types.Boolean,
    authed: Types.Boolean,
    locked: Types.Boolean,
    avatar: Types.CacheString,
    sortName: Types.CacheString,
    loggedOut: Types.Boolean,
    presenter: Types.Boolean,
    guestStatus: Types.CacheString,
    responseDelay: Types.Number,
    breakoutProps: UserBreakoutProps,

    // connectionStatus: Types.CacheString, // - nope
    effectiveConnectionType: Types.CacheString
  }};
}

