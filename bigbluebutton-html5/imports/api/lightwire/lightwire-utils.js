import { LightWire, Types } from '/imports/api/lightwire/lightwire';
import * as LWM from '/imports/api/lightwire/meteor-documents';

export const UpdateDocuments = {
  v2: LWM.UpdateFieldVector2D,
  v3: LWM.UpdateFieldVector3D,
  ub: LWM.UpdateFieldUByte,
  bool: LWM.UpdateFieldBoolean,
  b: LWM.UpdateFieldByte,
  us: LWM.UpdateFieldUShort,
  s: LWM.UpdateFieldShort,
  ui: LWM.UpdateFieldUInt,
  i: LWM.UpdateFieldInt,
  f: LWM.UpdateFieldFloat,
  d: LWM.UpdateFieldDouble,
  str: LWM.UpdateFieldString,
  o: LWM.UpdateFieldObject,
  lw: LWM.UpdateFieldLightWire,
  cs: LWM.UpdateFieldCacheString,
  aub: LWM.UpdateFieldUByteArray,
  ab: LWM.UpdateFieldByteArray,
  aus: LWM.UpdateFieldUShortArray,
  as: LWM.UpdateFieldShortArray,
  aui: LWM.UpdateFieldUIntArray,
  ai: LWM.UpdateFieldIntArray,
  af: LWM.UpdateFieldFloatArray,
  ad: LWM.UpdateFieldDoubleArray,
  astr: LWM.UpdateFieldStringArray,
  ao: LWM.UpdateFieldObjectArray,
  alw: LWM.UpdateFieldLightWireArray,
};

export const makeObj = function (doc) {
  if (doc === undefined || doc === null) { return null; }

  const obj = {};
  const schema = LightWire._schemas.get(doc.code);
  for (let i = 0, ilen = schema.length; i < ilen; i++) {
    const prop = schema[i];
    let val = doc[prop.name];
    if (Array.isArray(prop.type) && (LightWire.isDocument(prop.type[0]) || prop.type[0] === Types.LightWire)) {
      const ret = new Array(val.length);
      for (let j = 0, jlen = val.length; j < jlen; j++) {
        ret[j] = makeObj(val[j]);
      }
      val = ret;
    } else if (typeof val === 'object' && LightWire.isDocument(val)) {
      val = makeObj(val);
    }
    obj[prop.name] = val;
  }

  return obj;
};

// Make array of arguments from doc
export const makeArgs = function (doc) {
  const args = [];
  const schema = LightWire._schemas.get(doc.code);
  for (let i = 0, ilen = schema.length; i < ilen; i++) {
    const prop = schema[i];
    let val = doc[prop.name];
    if (Array.isArray(prop.type) && (LightWire.isDocument(prop.type[0]) || prop.type[0] === Types.LightWire)) {
      const ret = new Array(val.length);
      for (let j = 0, jlen = val.length; j < jlen; j++) {
        ret[j] = makeObj(val[j]);
      }
      val = ret;
    } else if (typeof val === 'object' && LightWire.isDocument(val)) {
      val = makeObj(val);
    }
    args.push(val);
  }
  return args;
};

// Make LW Document from object
export const makeDoc = function (dclass, obj) {
  if (obj === undefined || obj === null) { return null; }
  const doc = new dclass();
  const schema = LightWire._schemas.get(doc.code);
  for (let i = 0, ilen = schema.length; i < ilen; i++) {
    const prop = schema[i];
    const val = obj[prop.name];
    if (Array.isArray(prop.type) && LightWire.isDocument(prop.type[0])) {
      const ret = new Array(val.length);
      for (let j = 0, jlen = val.length; j < jlen; j++) {
        ret[j] = makeDoc(prop.type[0], val[j]);
      }
      doc[prop.name] = ret;
    } else if (typeof val === 'object' && LightWire.isDocument(prop.type)) { doc[prop.name] = makeDoc(prop.type, val); } else { doc[prop.name] = val; }
  }
  return doc;
};

// Make UpdateCollection from collection doc and fields object
export const makeUpdate = function (collection, id, dclass, obj) {
  if (obj === undefined || obj === null) { return null; }
  const doc = new LWM.UpdateCollection(collection, id);
  doc.updates = [];
  const schema = LightWire._schemas.get(dclass.code);
  for (let i = 0, ilen = schema.length; i < ilen; i++) {
    const prop = schema[i];
    const val = obj[prop.name];
    if (val !== undefined) {
      if (Array.isArray(prop.type) && LightWire.isDocument(prop.type[0])) {
        const values = [];
        for (let j = 0, jlen = val.length; j < jlen; j++) {
          values[j] = makeDoc(prop.type[0], val[j]);
        }
        doc.updates.push(new LWM.UpdateFieldLightWireArray(i, values));
      } else if (typeof val === 'object' && LightWire.isDocument(prop.type)) {
        doc.updates.push(new LWM.UpdateFieldLightWire(i, makeDoc(prop.type, val)));
      } else {
        const updateDoc = UpdateDocuments[prop.type];
        doc.updates.push(new updateDoc(i, val));
      }
    }
  }

  return doc;
};
