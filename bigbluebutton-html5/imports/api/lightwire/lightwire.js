import { CacheSet } from './cacheset';
import { Server } from './server';
import { Connection } from './connection';

// browserify-ignore-start
// browserify-ignore-end

let docCount = 1;

export const Types = {
  Vector2: 'v2',
  Vector3: 'v3',
  String: 'str',
  Object: 'o',
  Float: 'f',
  Double: 'd',
  Date: 'd',
  Number: 'd',
  Byte: 'b',
  UByte: 'ub',
  Short: 's',
  UShort: 'us',
  Int: 'i',
  UInt: 'ui',
  Boolean: 'bool',
  LightWire: 'lw',
  CacheString: 'cs',
};

const _strTypes = {};
for (const t in Types) {
  _strTypes[Types[t]] = 1;
}

export const Document = class Document {
  constructor() {
    this._code = this.constructor._code || null;// mclass._code;
    this._length = this.constructor._length || 0;// mclass._length || 0;
    this._isVarLength = this.constructor._isVarLength || false;// mclass._isVarLength || false;

    Object.defineProperty(this, '_code', { enumerable: false });
    Object.defineProperty(this, '_length', { enumerable: false });
    Object.defineProperty(this, '_isVarLength', { enumerable: false });
  }

  get code() {
    return this._code;
  }

  static get code() {
    return this._code;
  }

  get schema() {
    return false;
  }

  isDocument() {
    return true;
  }

  static isDocument() {
    return true;
  }
};

export const LightWire = class LightWire {
  static isDocument(msg) {
    return msg && msg.isDocument && msg.isDocument();
  }

  static pack(msgs) {
    return this._defaultCacheSet.pack(msgs);
  }

  static unpack(arrayBuffer, baseOffset, bufferLength) {
    return this._defaultCacheSet.unpack(arrayBuffer, baseOffset, bufferLength);
  }

  static registerDocument(mclass) {
    const addLength = (mclass, type) => {
      if (Array.isArray(type) || (typeof type === 'string' && type[0] === 'a')) {
        mclass._isVarLength = true;
        mclass._length += 4;
        if (LightWire.isDocument(type[0]) && type[0]._length === undefined) LightWire.registerDocument(type[0]);
      } else if (LightWire.isDocument(type)) {
        if (type._length === undefined) // unregistered
        { LightWire.registerDocument(type); }

        if (type._isVarLength) {
          mclass._isVarLength = true;
        } else {
          mclass._length += type._length + 2;
        }
      } else {
        switch (type) {
          case 'v2':
          case 'd':
            mclass._length += 8;
            break;
          case 'v3':
            mclass._length += 12;
          case 'str':
          case 'o':
            mclass._isVarLength = true;
            mclass._length += 2; // length
            break;
          case 'lw':
          case 'cs':
            mclass._isVarLength = true;
            mclass._length += 4;
            break;
          case 'f':
          case 'i':
          case 'ui':
            mclass._length += 4;
            break;
          case 'b':
          case 'ub':
          case 'bool':
            mclass._length += 1;
            break;
          case 's':
          case 'us':

            mclass._length += 2;
        }
      }
    };

    if (mclass.hasOwnProperty('_code') && mclass._code > 0) return;

    mclass._code = docCount++;
    LightWire._documents.set(mclass._code, mclass);

    const instance = new mclass();
    mclass._length = 0;
    const schema = [];
    LightWire._schemas.set(mclass._code, schema);

    // recursively build schema from superclasses
    const buildSchema = (instance, indent) => {
      const schema = instance.schema;
      if (schema) return { ...buildSchema(instance.__proto__, `${indent}  `), ...schema };
      return schema;
    };

    const classSchema = buildSchema(instance.__proto__, '  ');
    if (classSchema) {
      for (const name in classSchema) {
        let type = classSchema[name];
        if (Array.isArray(type) && typeof type[0] === 'string') type = `a${type[0]}`;
        const p = { name, type };
        addLength(mclass, type);

        // validate type/name
        if (!type || type === 'abool') {
          throw new Error(`LightWire invalid type: ${type} for ${mclass.name}.${name}`);
        } else if (!(LightWire.isDocument(type) || (Array.isArray(type) && LightWire.isDocument(type[0])))) {
          const rx = /^a?(.*)$/g.exec(type)[1];
          if (!_strTypes[rx]) {
            throw new Error(`LightWire invalid type: ${type} for ${mclass.name}.${name}`);
          }
        }

        schema.push(p);
      }
    } else {
      // auto-schema
      for (const name in instance) {
        const match = name.match(/^__(v2|v3|str|o|lw|f|d|b|s|i|ub|us|ui|bool)./);
        if (!match) continue;

        const type = match[1];
        const p = { name, type };
        addLength(mclass, type);
        schema.push(p);
      }
    }

    return mclass;
  }
};
LightWire._defaultCacheSet = new CacheSet();
LightWire._schemas = new Map();
LightWire._documents = new Map();
LightWire.Connection = Connection;
LightWire.Server = Server;
LightWire.CacheSet = CacheSet;
LightWire._debugging = false;
console.log('LightWire._debug', LightWire._debug);
LightWire._debug = {
  debug: (...args) => {
    if (LightWire._debugging) console.debug('[LightWire]', ...args);
  },
  log: (...args) => {
    if (LightWire._debugging) console.log('[LightWire]', ...args);
  },
  info: (...args) => {
    console.info('[LightWire]', ...args);
  },
  warn: (...args) => {
    console.warn('[LightWire]', ...args);
  },
  error: (...args) => {
    console.error('[LightWire]', ...args);
  },
};
console.log('LightWire._debug2', LightWire._debug);


export class UpdateCacheSet extends Document {
  constructor(startIndex, strings) {
    super();
    this.startIndex = startIndex;
    this.strings = strings;
  }

  get schema() {
    return { startIndex: Types.UInt, strings: [Types.String] };
  }
}

LightWire.registerDocument(UpdateCacheSet);

export class UseCacheSet extends Document {
  constructor(cacheName, startIndex) {
    super();
    this.cacheName = cacheName;
    this.startIndex = Math.max(1, startIndex || 1);
  }

  get schema() {
    return { cacheName: Types.String, startIndex: Types.UInt };
  }
}

LightWire.registerDocument(UseCacheSet);

export class JSONDocument extends Document {
  constructor(object) {
    super();
    this.object = object || null;
  }

  get schema() {
    return { object: Types.Object };
  }
}

LightWire.registerDocument(JSONDocument);
