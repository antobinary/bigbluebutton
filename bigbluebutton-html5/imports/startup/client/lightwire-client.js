import { Tracker } from 'meteor/tracker';
import { Meteor } from 'meteor/meteor';
import EventEmitter2 from 'eventemitter2';

import Auth from '/imports/ui/services/auth';
import { LightWire, Types, JSONDocument } from '/imports/api/lightwire/lightwire';
import {
  UpdateDocuments, makeDoc, makeArgs, makeObj,
} from '/imports/api/lightwire/lightwire-utils';
import * as LWM from '/imports/api/lightwire/meteor-documents';
import * as LWM2 from '/imports/api/lightwire/app-documents';

LWM = { ...LWM, ...LWM2 };
const {
  MeteorCall, MeteorSubscribe, MeteorUnsubscribe, MeteorReady, UpdateCollection,
  MeteorCallSuccess, MeteorCallError, DefaultAdded, DefaultChanged, DefaultRemoved,
  ChannelJoin, ChannelResult, ChannelLeave, ChannelDocument,
} = LWM;

const methodDocuments = {};
const channelDocuments = {};
const collectionDocuments = {};
const collections = {};

let debugging = ((new URL(window.location.href)).searchParams.get('debug') === 'true') || Meteor.settings.public.lightwire.debug || false;

_debug = {
  debug: (...args) => { if (debugging) console.debug('[LW-Client]', ...args); },
  log: (...args) => { if (debugging) console.log('[LW-Client]', ...args); },
  info: (...args) => { console.info('[LW-Client]', ...args); },
  warn: (...args) => { console.warn('[LW-Client]', ...args); },
  error: (...args) => { console.error('[LW-Client]', ...args); },
};

const LWStreamerCentral = class LWStreamerCentral {
  constructor() {
    this.instances = {};
  }
};

const StreamerCentral = new LWStreamerCentral();

const LWStreamer = class LWStreamer {
  constructor(name) {
    if (StreamerCentral.instances[name]) {
      return StreamerCentral.instances[name];
    }

    StreamerCentral.instances[name] = this;
    this._name = name;
    this._emitter = new EventEmitter2();
    this._stopped = false;

    LWMeteorSingleton._conn.send(new ChannelJoin(name));
  }

  stop() {
    delete StreamerCentral.instances[this._name];
    this._stopped = true;
    LWMeteorSingleton._conn.send(new ChannelLeave(this._name));
  }

  _incoming(doc) {
    if (doc.code === ChannelDocument.code) this._emitter.emit(doc.event, doc.doc);
    else {
      const obj = makeObj(doc);
      delete obj.channel;
      delete obj._event;
      this._emitter.emit(doc._event, obj);
    }
  }

  on(event, func) {
    return this._emitter.on(event, func);
  }

  emit(event, payload) {
    const dclass = channelDocuments[event];
    let cdoc;
    if (dclass) {
      cdoc = makeDoc(dclass, payload);
      cdoc.channel = this._name;
    } else cdoc = new ChannelDocument(this._name, event, payload);

    LWMeteorSingleton._conn.send(cdoc);
  }
};


const d0 = Date.now();


const LWCollection = class LWCollection extends Mongo.Collection {
  constructor(name) {
    // super(name, {connection:null});
    super(null);
    // super(name);
    collections[name] = this;
    this._collection._lwname = name;

    this._nextId = 1;
    this._makeNewID = () => (this._nextId++).toString();
  }

  // _ensureIndex(...args){
  // _debug.log(`LWCollection ignoring _ensureIndex for collection ${this._collection._lwname}`)
  // }
};


const LWMeteorClient = class LWMeteorClient {
  constructor(url, sessionToken) {
    // "connected", "disconnected", "connecting", "failed", "waiting", "offline"
    // retryTime, reason
    this._status = { status: 'connecting', connected: false, retryCount: 0 };
    this._statusDep = new Tracker.Dependency();

    this._sessionToken = sessionToken;
    _debug.log('CLIENT INIT', (Date.now() - d0));
    this._conn = new LightWire.Connection(url);// , options);
    _debug.log('CLIENT connect', (Date.now() - d0));
    this._reconnectTimeout = null;
    this._closeCalled = false;

    this._nextSubId = 1;
    this._subscriptions = {};
    this._subscriptionNames = {};
    this._runningCalls = {};
    this._nextRequestId = 1;
    const self = this;

    this._conn.onopen = (event) => {
      _debug.log('CLIENT onopen', (Date.now() - d0));
      this._clearTimeout();
      this._closeCalled = false;
      this._runningCalls = {};
      this._nextRequestId = 1;

      _debug.log('Connected', Auth.meetingID);
      if (Auth.meetingID) {
        this._conn.changeCacheSet(Auth.meetingID);
        // this._conn.sendJSON({setauthcredentials: Auth.credentials});              //TEMP
      } else {
        Tracker.autorun((c) => {
          _debug.log('AutoRUN Auth on Connection');
          _debug.log('CLIENT autorun', (Date.now() - d0));
          if (Auth.loggedIn && Auth.meetingID && this._status.connected) {
            this._conn.changeCacheSet(Auth.meetingID);
            // this._conn.sendJSON({setauthcredentials: Auth.credentials});         //TEMP
            _debug.log('STOP autorun tracker');
            c.stop();
          } else if (this._status.status === 'offline' || this._status.status === 'failed') {
            c.stop();
          }
        });
      }

      delete this._status.reason;
      delete this._status.retryTime;
      this._status.status = 'connected';
      this._status.connected = true;
      this._status.retryCount = this._conn.retryCount;
      this._statusDep.changed();
    };

    this._conn.onclose = (event) => {
      this._clearTimeout();

      // reject running calls
      for (const requestId in this._runningCalls) {
        const { func, method } = this._runningCalls[requestId];
        func(`Cancelling running call '${method}' due to disconnection`);
      }
      this._runningCalls = {};

      if (this._closeCalled) {
        delete this._status.retryTime;
        this._status.status = 'offline';
        this._status.connected = false;
        this._status.retryCount = 0;
        this._statusDep.changed();
        return;
      }

      const {
        minReconnectionDelay, maxReconnectionDelay, reconnectionDelayGrowFactor, maxRetries,
      } = this._conn._options;
      let delay = minReconnectionDelay;
      if (this._conn.retryCount > 1) {
        delay = minReconnectionDelay * Math.pow(reconnectionDelayGrowFactor, this._conn.retryCount - 2);
        if (delay > maxReconnectionDelay) {
          delay = maxReconnectionDelay;
        }
      }
      _debug.log('ONCLOSE', delay, this._conn.retryCount);

      this._status.status = 'waiting';
      this._status.connected = false;
      this._status.retryCount = this._conn.retryCount - 1;
      this._status.retryTime = new Date().getTime() + delay;

      if (this._status.retryCount >= maxRetries) {
        this._status.status = 'failed';
        this._status.reason = event.reason || event.code;
      } else {
        this._reconnectTimeout = setTimeout(() => {
          _debug.log('POSTDELAY');
          delete this._status.retryTime;
          this._status.status = 'connecting';
          this._status.connected = false;
          this._status.retryCount = this._conn.retryCount;
          this._statusDep.changed();
        }, delay);
      }

      this._statusDep.changed();
    };

    this._conn.onerror = (event) => {
      this._clearTimeout();
    };

    this._conn.on(MeteorCallSuccess, (doc) => {
      const runningCall = self._runningCalls[doc.requestId];
      if (runningCall) {
        delete self._runningCalls[doc.requestId];
        runningCall.func();
      }
    });

    this._conn.on(MeteorCallError, (doc) => {
      const runningCall = self._runningCalls[doc.requestId];
      if (runningCall) {
        delete self._runningCalls[doc.requestId];
        runningCall.func(`Error running call '${runningCall.method}': ${doc.error}`);
      }
    });

    this._conn.on(MeteorUnsubscribe, (doc) => {
      const sub = self._subscriptions[doc.subId];
      if (sub) {
        if (sub.onError) sub.onError(doc.error);
        if (sub.onStop) sub.onStop(doc.error);

        sub._cancel();
      }
    });

    this._conn.on(MeteorReady, (doc) => {
      // doc.subName;
      const sub = self._subscriptions[doc.subId];
      if (sub) {
        sub._ready = true;
        if (sub.onReady) sub.onReady();
        sub._readyDep.changed();
      }
      _debug.log('MeteorReady', sub && sub.name, self._subscriptions[doc.subId]);
    });

    this._conn.on(DefaultAdded, (doc) => {
      const collection = collections[doc.collection];
      if (!collection) return _debug.warn(`Warning: DefaultAdded -- No LightWire managed collection for ${doc.collection}`);

      const cb = (err) => {
        if (err) {
          return _debug.error(`LW Collection '${doc.collection}' ADDED error: ${err}`);
        }
        return _debug.log(`LW Collection '${doc.collection}' ADDED insert successful`);
      };

      doc.fields._id = doc._id.toString();
      collection.insert(doc.fields, cb);
    });

    this._conn.on(DefaultChanged, (doc) => {
      const collection = collections[doc.collection];
      if (!collection) return _debug.warn(`Warning: DefaultChanged -- No LightWire managed collection for ${doc.collection}`);

      const cb = (err) => {
        if (err) {
          return _debug.error(`LW Collection '${doc.collection}' UPDATE error: ${err}`);
        }
        return _debug.log(`LW Collection '${doc.collection}' UPDATE upsert successful`);
      };

      collection.update(doc._id.toString(), { $set: doc.fields }, cb);
    });

    this._conn.on(DefaultRemoved, (doc) => {
      const collection = collections[doc.collection];
      if (!collection) return _debug.warn(`Warning: DefaultRemoved -- No LightWire managed collection for ${doc.collection}`);

      const cb = (err) => {
        if (err) {
          return _debug.error(`LW Collection '${doc.collection}' REMOVE error: ${err}`);
        }
        return _debug.log(`LW Collection '${doc.collection}' REMOVE remove successful`);
      };

      collection.remove(doc._id.toString());
    });

    this._conn.on(UpdateCollection, (doc) => {
      const collection = collections[doc.collection];
      const colDoc = collectionDocuments[doc.collection];
      const cb = (err) => {
        if (err) {
          return _debug.error(`LW Collection '${doc.collection}' UPDATE error: ${err}`);
        }
        return _debug.log(`LW Collection '${doc.collection}' UPDATE upsert successful`);
      };

      const updateObj = {};
      const updates = doc.updates;
      const schema = LightWire._schemas.get(colDoc.code);
      for (let i = 0, ilen = updates.length; i < ilen; i++) {
        const u = updates[i];
        const prop = schema[u.field];
        updateObj[prop.name] = u.value;
      }

      _debug.log('UpdateObj', doc._id, updateObj);

      collection.update(doc._id.toString(), { $set: updateObj }, cb);
    });

    this._conn.on(ChannelResult, (doc) => {
      if (doc.error) {
        _debug.error(`ChannelJoinResult: ${doc.error}`);
      }
    });

    this._conn.on(ChannelDocument, (doc) => {
      const channelName = doc.channel;
      const channel = StreamerCentral.instances[channelName];
      if (!channel) {
        if (debugging) _debug.log(`ChannelDocument received for non-existent channel '${channelName}'`, JSON.stringify(doc));
      } else channel._incoming(doc);
    });

    for (const eventName in channelDocuments) {
      _debug.log(`Starting channel listener for ${eventName}`);
      const channelDoc = channelDocuments[eventName];
      this._conn.on(channelDoc, (doc) => {
        const channelName = doc.channel;
        const channel = StreamerCentral.instances[channelName];
        channel._incoming(doc);
      });
    }

    for (const collName in collectionDocuments) {
      _debug.log(`Starting listener for ${collName}`);
      const colDoc = collectionDocuments[collName];
      this._conn.on(colDoc, (doc) => {
        const collection = collections[collName];
        // const obj = makeObj(doc);
        const cb = (err) => {
          if (err) {
            return _debug.error(`LW Collection '${collName}' ADD error: ${err}`);
          }
          return _debug.log(`LW Collection '${collName}' ADD insert successful`);
        };

        doc._id = doc._id.toString();
        collection.insert(doc, cb);
      });
    }
  }

  _clearTimeout() {
    if (this._reconnectTimeout) {
      clearTimeout(this._reconnectTimeout);
      this._reconnectTimeout = null;
    }
    delete this._status.retryTime;
  }

  get connection() { return this._conn; }

  status() {
    this._statusDep.depend();
    return this._status;
  }

  call(method, ...args) {
    let argsArr = [...args];
    let callback = null;
    if (argsArr.length > 0) {
      const last = argsArr[argsArr.length - 1];
      if (typeof last === 'function') {
        callback = last;
        argsArr = argsArr.slice(0, -1);
      }
    }

    const requestId = this._nextRequestId++;
    if (callback) this._runningCalls[requestId] = { func: callback, method };

    let doc = methodDocuments[method];
    if (doc) {
      doc = new doc(...argsArr);
      doc._requestId = requestId;
    } else doc = new MeteorCall(method, requestId, ...argsArr);

    this._conn.send(doc);
  }

  methods() {
  }

  subscribe(name, ...args) {
    let callbacks = { onReady: null, onError: null, onStop: null };
    let argsArr = [...args];
    if (argsArr.length > 0) {
      const last = argsArr[argsArr.length - 1];
      if (typeof last === 'object' && (typeof last.onReady === 'function' || typeof last.onError === 'function' || typeof last.onStop === 'function')) {
        callbacks = { ...callbacks, ...last };
        argsArr = argsArr.slice(0, -1);
      }
    }

    const nameParams = name + JSON.stringify(argsArr);
    let sub = this._subscriptionNames[nameParams];
    if (sub) {
      sub.invalidated = false; // don't delete this sub since it was re-subbed in tracker
    } else {
      const subId = this._nextSubId++;
      const subDoc = new MeteorSubscribe(subId, name, ...argsArr);
      const self = this;

      sub = {
        id: subId,
        subscriptionId: subId,
        name,
        nameParams,
        doc: subDoc,
        invalidated: false,
        onReady: callbacks.onReady,
        onError: callbacks.onError,
        onStop: callbacks.onStop,
        _ready: false,
        _readyDep: new Tracker.Dependency(),

        _cancel() {
          delete self._subscriptions[subId];
          delete self._subscriptionNames[nameParams];
          if (this._ready) this._readyDep.changed();
          // this._ready = false;
        },

        stop() {
          self._conn.send(new MeteorUnsubscribe(subId));

          this._cancel();

          if (this.onStop) this.onStop();
        },

        ready() {
          this._readyDep.depend();
          return this._ready;
        },
      };

      this._subscriptions[subId] = sub;
      this._subscriptionNames[nameParams] = sub;
      this._conn.send(subDoc);
    }

    // Handle unsub from tracker invalidation
    if (Tracker.active) {
      Tracker.onInvalidate((c) => {
        if (this._subscriptions[sub.id]) this._subscriptions[sub.id].invalidated = true;

        Tracker.afterFlush(() => {
          if (this._subscriptions[sub.id] && this._subscriptions[sub.id].invalidated) sub.stop();
        });
      });
    }


    return sub;
  }

  publish() {
  }

  disconnect() {
    delete this._status.retryTime;
    Meteor.disconnect();
    this._status.retryCount = 0;
    this._status.status = 'disconnected';
    this._status.connected = false;
    this._statusDep.changed();

    this._closeCalled = true;
    this._conn.close();
  }

  reconnect() {
    delete this._status.reason;
    delete this._status.retryTime;
    Meteor.reconnect();
    this._status.retryCount = 0;
    this._status.status = 'connecting';
    this._status.connected = false;
    this._statusDep.changed();

    this._closeCalled = true;
    this._conn.close();
  }
};

Object.keys(LWM).sort().forEach((mclass) => {
  _debug.log(`Registering ${mclass}`);
  LightWire.registerDocument(LWM[mclass]);
  const instance = new LWM[mclass]();
  if (instance._method) {
    if (instance._requestId === undefined) {
      _debug.error(`ERROR: LightWire Method Document '${mclass}' doesn't contain a _requestId field.  Be sure to extend MethodDocuent.  Skipping.`);
    } else methodDocuments[instance._method] = LWM[mclass];
  }
  if (instance._collection) {
    const schema = LightWire._schemas.get(instance.code);
    let valid = true;
    for (let i = 0, ilen = schema.length; i < ilen; i++) {
      const prop = schema[i];
      if (prop.type === Types.LightWire || (Array.isArray(prop.type) && prop.type[0] === Types.LightWire)) {
        valid = false;
        _debug.error(`ERROR: LightWire Collection Document '${mclass}' can't contain Types.LightWire field.  Skipping.`);
        break;
      }
    }
    if (valid) collectionDocuments[instance._collection] = LWM[mclass];
  }
  if (instance._event && instance.channel !== undefined) {
    channelDocuments[instance._event] = LWM[mclass];
  }
});
_debug.log('METHOD-DOCUMENTS', methodDocuments);
_debug.log('COLLECTION-DOCUMENTS', collectionDocuments);
_debug.log('CHANNEL-DOCUMENTS', channelDocuments);


const url = new URL(window.location.href);
const sessionToken = url.searchParams.get('sessionToken');
const instanceId = /\/html5client\/(\d+)\//g.exec(url.pathname)[1];
const LWMeteorSingleton = new LWMeteorClient(`wss://${window.location.host}/${instanceId}/lightwire?sessionToken=${sessionToken}`);
// const LWMeteorSingleton = new LWMeteorClient(`wss://${window.location.host}/${instanceId}/lightwire?sessionToken=${sessionToken}`);
LWMeteorSingleton.Collection = LWCollection;
LWMeteorSingleton.StreamerCentral = StreamerCentral;
LWMeteorSingleton.Streamer = LWStreamer;


window.LightWire = {
  _debug: false,
  _oldSend: null,
  debug() {
    if (this._debug) {
      debugging = false;
      LightWire._debugging = false;
      LWMeteorSingleton._conn.offAny(this._debug);
      LWMeteorSingleton._conn.send = this._oldSend;
      this._debug = false;
    } else {
      debugging = true;
      LightWire._debugging = true;
      this._debug = LWMeteorSingleton._conn.onAny((doc) => {
        _debug.log('RECEIVED:', doc);
      });
      this._oldSend = LWMeteorSingleton._conn.send;
      const self = this;
      LWMeteorSingleton._conn.send = function (docs) {
        _debug.log('SEND:', docs);
        self._oldSend(docs);
      };
    }
  },
  decode(b64) {
    return LWMeteorSingleton._conn._cacheSet.unpack((Uint8Array.from(atob(b64), c => c.charCodeAt(0))).buffer);
  },

  createFake(count) {
    LWMeteorSingleton._conn.send(new JSONDocument({ command: 'createFake', meetingId: Auth.meetingID, count }));
  },
  removeFake(count) {
    LWMeteorSingleton._conn.send(new JSONDocument({ command: 'removeFake', meetingId: Auth.meetingID, count }));
  },
};

if (debugging) window.LightWire.debug();

export { LightWire, LWMeteorSingleton as LWMeteor };
