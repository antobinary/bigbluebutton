import { LightWire, Document, Types } from '/imports/api/lightwire/lightwire';


//= ===========LIGHTWIRE METEOR DOCUMENTS===================
export class MeteorCall extends Document {
  constructor(method, requestId, ...args) {
    super();
    this.method = method;
    this.requestId = requestId;
    this.args = [...args];
  }

  get schema() { return { method: Types.String, requestId: Types.UInt, args: [Types.Object] }; }
}

export class MeteorCallSuccess extends Document {
  constructor(requestId) {
    super();
    this.requestId = requestId;
  }

  get schema() { return { requestId: Types.UInt }; }
}

export class MeteorCallError extends Document {
  constructor(requestId, error) {
    super();
    this.requestId = requestId;
    this.error = error;
  }

  get schema() { return { requestId: Types.UInt, error: Types.String }; }
}

export class MeteorSubscribe extends Document {
  constructor(subId, subName, ...args) {
    super();
    this.subId = subId;
    this.subName = subName;
    this.args = [...args];
  }

  get schema() { return { subId: Types.UShort, subName: Types.CacheString, args: [Types.Object] }; }
}

export class MeteorReady extends Document {
  constructor(subId, subName) {
    super();
    this.subId = subId;
  }

  get schema() { return { subId: Types.UShort }; }
}

export class MeteorUnsubscribe extends Document {
  constructor(subId, error) {
    super();
    this.subId = subId;
    this.error = error || null;
  }

  get schema() { return { subId: Types.UShort, error: Types.String }; }
}

export class ChannelJoin extends Document {
  constructor(channel) {
    super();
    this.channel = channel;
  }

  get schema() { return { channel: Types.CacheString }; }
}

export class ChannelResult extends Document {
  constructor(channel, error) {
    super();
    this.channel = channel;
    this.error = null;
  }

  get schema() { return { channel: Types.CacheString, error: Types.String }; }
}

export class ChannelLeave extends Document {
  constructor(channel) {
    super();
    this.channel = channel;
  }

  get schema() { return { channel: Types.CacheString }; }
}

export class ChannelDocument extends Document {
  constructor(channel, event, doc) {
    super();
    this.channel = channel;
    this.event = event;
    this.doc = doc;
  }

  get schema() { return { channel: Types.CacheString, event: Types.CacheString, doc: Types.Object }; }
}

export class DefaultAdded extends Document {
  constructor(collection, id, fields) {
    super();
    this.collection = collection;
    this._id = id;
    this.fields = fields;
  }

  get schema() { return { collection: Types.CacheString, _id: Types.UInt, fields: Types.Object }; }
}

export class DefaultChanged extends Document {
  constructor(collection, id, fields) {
    super();
    this.collection = collection;
    this._id = id;
    this.fields = fields;
  }

  get schema() { return { collection: Types.CacheString, _id: Types.UInt, fields: Types.Object }; }
}

export class DefaultRemoved extends Document {
  constructor(collection, id, fields) {
    super();
    this.collection = collection;
    this._id = id;
  }

  get schema() { return { collection: Types.CacheString, _id: Types.UInt }; }
}


export class UpdateCollection extends Document {
  constructor(collection, id, updates) {
    super();
    this.collection = collection;
    this._id = id;
    this.updates = updates;
  }

  get schema() { return { collection: Types.CacheString, _id: Types.UInt, updates: [Types.LightWire] }; }
}

export class MethodDocument extends Document {
  constructor() {
    super();
    this._requestId = 0;
  }

  get schema() { return { _requestId: Types.UInt }; }
}

class UpdateFieldBase extends Document {
  constructor(field) {
    super();
    this.field = field;
  }

  get schema() { return { field: Types.UShort }; }
}

export class UpdateFieldVector2D extends UpdateFieldBase {
  constructor(field, value) {
    super(field);
    this.value = value;// {x: 0, y:0};
  }

  get schema() { return { value: Types.Vector2 }; }
}

export class UpdateFieldVector3D extends UpdateFieldBase {
  constructor(field, value) {
    super(field);
    this.value = value; // {x:0, y:0, z:0}
  }

  get schema() { return { value: Types.Vector3 }; }
}

export class UpdateFieldUByte extends UpdateFieldBase {
  constructor(field, value) {
    super(field);
    this.value = value;
  }

  get schema() { return { value: Types.UByte }; }
}

export class UpdateFieldBoolean extends UpdateFieldBase {
  constructor(field, value) {
    super(field);
    this.value = value;
  }

  get schema() { return { value: Types.Boolean }; }
}

export class UpdateFieldByte extends UpdateFieldBase {
  constructor(field, value) {
    super(field);
    this.value = value;
  }

  get schema() { return { value: Types.Byte }; }
}

export class UpdateFieldUShort extends UpdateFieldBase {
  constructor(field, value) {
    super(field);
    this.value = value;
  }

  get schema() { return { value: Types.UShort }; }
}

export class UpdateFieldShort extends UpdateFieldBase {
  constructor(field, value) {
    super(field);
    this.value = value;
  }

  get schema() { return { value: Types.Short }; }
}

export class UpdateFieldUInt extends UpdateFieldBase {
  constructor(field, value) {
    super(field);
    this.value = value;
  }

  get schema() { return { value: Types.UInt }; }
}

export class UpdateFieldInt extends UpdateFieldBase {
  constructor(field, value) {
    super(field);
    this.value = value;
  }

  get schema() { return { value: Types.Int }; }
}

export class UpdateFieldFloat extends UpdateFieldBase {
  constructor(field, value) {
    super(field);
    this.value = value;
  }

  get schema() { return { value: Types.Float }; }
}

export class UpdateFieldDouble extends UpdateFieldBase {
  constructor(field, value) {
    super(field);
    this.value = value;
  }

  get schema() { return { value: Types.Double }; }
}

export class UpdateFieldString extends UpdateFieldBase {
  constructor(field, value) {
    super(field);
    this.value = value;
  }

  get schema() { return { value: Types.String }; }
}

export class UpdateFieldObject extends UpdateFieldBase {
  constructor(field, value) {
    super(field);
    this.value = value;
  }

  get schema() { return { value: Types.Object }; }
}

export class UpdateFieldLightWire extends UpdateFieldBase {
  constructor(field, value) {
    super(field);
    this.value = value;
  }

  get schema() { return { value: Types.LightWire }; }
}

export class UpdateFieldCacheString extends UpdateFieldBase {
  constructor(field, value) {
    super(field);
    this.value = value;
  }

  get schema() { return { value: Types.CacheString }; }
}

export class UpdateFieldUByteArray extends UpdateFieldBase {
  constructor(field, value) {
    super(field);
    this.value = value;
  }

  get schema() { return { value: [Types.UByte] }; }
}

export class UpdateFieldByteArray extends UpdateFieldBase {
  constructor(field, value) {
    super(field);
    this.value = value;
  }

  get schema() { return { value: [Types.Byte] }; }
}

export class UpdateFieldUShortArray extends UpdateFieldBase {
  constructor(field, value) {
    super(field);
    this.value = value;
  }

  get schema() { return { value: [Types.UShort] }; }
}

export class UpdateFieldShortArray extends UpdateFieldBase {
  constructor(field, value) {
    super(field);
    this.value = value;
  }

  get schema() { return { value: [Types.Short] }; }
}

export class UpdateFieldUIntArray extends UpdateFieldBase {
  constructor(field, value) {
    super(field);
    this.value = value;
  }

  get schema() { return { value: [Types.UInt] }; }
}

export class UpdateFieldIntArray extends UpdateFieldBase {
  constructor(field, value) {
    super(field);
    this.value = value;
  }

  get schema() { return { value: [Types.Int] }; }
}

export class UpdateFieldFloatArray extends UpdateFieldBase {
  constructor(field, value) {
    super(field);
    this.value = value;
  }

  get schema() { return { value: [Types.Float] }; }
}

export class UpdateFieldDoubleArray extends UpdateFieldBase {
  constructor(field, value) {
    super(field);
    this.value = value;
  }

  get schema() { return { value: [Types.Double] }; }
}

export class UpdateFieldStringArray extends UpdateFieldBase {
  constructor(field, value) {
    super(field);
    this.value = value;
  }

  get schema() { return { value: [Types.String] }; }
}

export class UpdateFieldObjectArray extends UpdateFieldBase {
  constructor(field, value) {
    super(field);
    this.value = value;
  }

  get schema() { return { value: [Types.Object] }; }
}

export class UpdateFieldLightWireArray extends UpdateFieldBase {
  constructor(field, value) {
    super(field);
    this.value = value;
  }

  get schema() { return { value: [Types.LightWire] }; }
}

//= ===========LIGHTWIRE METEOR DOCUMENTS===================


//= ===========LIGHTWIRE APP DOCUMENTS===================

export class TestCollection extends Document {
  constructor() {
    super();
    this._collection = 'test2';
    this._id = 0;
    this.str = 'asdf';
  }

  get schema() { return { _id: Types.UInt, str: Types.String }; }
}

export class Test2Add extends MethodDocument {
  constructor() {
    super();
    this._method = 'test2add';
  }

  // get schema(){return {}}}
}
export class Test2Change extends MethodDocument {
  constructor() {
    super();
    this._method = 'test2change';
  }

  // get schema(){return {}}}
}
export class Test2Remove extends MethodDocument {
  constructor() {
    super();
    this._method = 'test2remove';
  }

  // get schema(){return {}}}
}

export class UpdateCursor extends Document {
  constructor() {
    super();
    this.channel = null;
    this._event = 'publish';
    this.xPercent = 0.0;
    this.yPercent = 0.0;
    this.whiteboardId = null;
  }

  get schema() {
    return {
      channel: Types.CacheString, xPercent: Types.Float, yPercent: Types.Float, whiteboardId: Types.CacheString,
    };
  }
}

export class UpdateCursorsSub extends Document {
  constructor() {
    super();
    this.userId = null;
    this.xPercent = 0.0;
    this.yPercent = 0.0;
    this.whiteboardId = null;
  }

  get schema() {
    return {
      userId: Types.CacheString, xPercent: Types.Float, yPercent: Types.Float, whiteboardId: Types.CacheString,
    };
  }
}

export class UpdateCursors extends Document {
  constructor() {
    super();
    this.channel = null;
    this._event = 'message';
    this.cursors = null;
  }

  get schema() { return { channel: Types.CacheString, cursors: [UpdateCursorsSub] }; }
}
//= ===========LIGHTWIRE APP DOCUMENTS===================
