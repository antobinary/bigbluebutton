import { Meteor } from 'meteor/meteor';
import { LightWire, JSONDocument, Types } from '/imports/api/lightwire/lightwire';
import EventEmitter2 from 'eventemitter2';
import LWCollection from './lightwire-collection';
import {
  UpdateDocuments, makeDoc, makeArgs, makeObj, makeUpdate,
} from '/imports/api/lightwire/lightwire-utils';
import * as LWM from '/imports/api/lightwire/meteor-documents';
import * as LWM2 from '/imports/api/lightwire/app-documents';

LWM = { ...LWM, ...LWM2 };
const {
  MeteorCall, MeteorSubscribe, MeteorUnsubscribe, MeteorReady,
  MeteorCallSuccess, MeteorCallError, DefaultAdded, DefaultChanged, DefaultRemoved,
  ChannelJoin, ChannelResult, ChannelLeave, ChannelDocument,
} = LWM;

const methodDocuments = {};
const channelDocuments = {};
const collectionDocuments = {};
const collections = {};
const userIds = {};

let debugging = true;
let allowFakeClients = true;

const instanceMax = parseInt(process.env.INSTANCE_MAX || '1');
const instanceId = parseInt(process.env.INSTANCE_ID || '1');

_debug = {
  debug: (...args) => { if (debugging) console.debug('[LW-Server]', ...args); },
  log: (...args) => { if (debugging) console.log('[LW-Server]', ...args); },
  info: (...args) => { console.info('[LW-Server]', ...args); },
  warn: (...args) => { console.warn('[LW-Server]', ...args); },
  error: (...args) => { console.error('[LW-Server]', ...args); },
};


const baseUser = {
  meetingId: 'asdf',
  userId: 'asdf',
  authToken: 'fakefakefake',
  clientType: 'HTML5',
  validated: true,
  connectionId: '1000000',
  approved: true,
  loginTime: new Date().getTime(),
  inactivityCheck: false,
  role: 'VIEWER',
  name: 'asdf',
  emoji: 'none',
  extId: 'asdf',
  color: '#5e35b1',
  intId: 'asdf',
  guest: true,
  authed: false,
  locked: true,
  avatar: 'some.url/avatar.png',
  sortName: 'asdf',
  loggedOut: false,
  presenter: false,
  guestStatus: 'ALLOW',
  responseDelay: 0,
  breakoutProps: { parentId: 'bbb-none', isBreakoutUser: false },
  connectionStatus: 'online',
  effectiveConnectionType: null,
};
const baseVoiceUser = {
  meetingId: 'asdf',
  intId: 'asdf',
  muted: false,
  spoke: false,
  joined: false,
  talking: false,
  callerNum: '',
  voiceConf: '',
  callerName: 'asdf',
  listenOnly: false,
  voiceUserId: '',
  callingWith: '',
};
const fakeMeetingCount = {};
const fakeObservers = {};
const SUBSCRIPTIONS = [
  'users', 'meetings', 'polls', 'presentations', 'slides', 'slide-positions', 'captions',
  'voiceUsers', 'whiteboard-multi-user', 'screenshare', 'group-chat', 'group-chat-msg',
  /* 'presentation-pods', 'users-settings', 'guestUser', */ 'users-infos', 'note', /* 'meeting-time-remaining', */
  // 'network-information', 'local-settings', /*'users-typing'*/, 'record-meetings', 'video-streams',
  /* 'network-information', 'local-settings', */'users-typing', /* 'record-meetings' */, 'video-streams',
  'voice-call-states', 'breakouts',
];

function debugCreateFake(meetingId, count) {
  fakeMeetingCount[meetingId] = fakeMeetingCount[meetingId] || 1;
  fakeObservers[meetingId] = fakeObservers[meetingId] || {};
  for (let i = 0; i < count; i++) {
    const fakeCount = fakeMeetingCount[meetingId];
    const id = `w_fake${10000000 + fakeCount}`;
    const name = `FAKE ${fakeCount}`;
    const connId = `10000${fakeCount}`;

    const user = {
      ...baseUser,
      ...{
        meetingId, userId: id, connectionId: connId, name, intId: id, sortName: name, extId: id,
      },
    };
    const voiceUser = { ...baseVoiceUser, ...{ meetingId, intId: id, callerName: name } };
    LWCollection.collections.users.insert(user);
    LWCollection.collections.voiceUsers.insert(voiceUser);

    fakeObservers[meetingId][fakeCount] = [];

    SUBSCRIPTIONS.forEach((sub) => {
      let ret = null;
      if (fakeCount == 1) {
        ret = LWCollection.collections[sub].find({ meetingId }).observeChanges({
          added: (id, fields, documentCacheId) => {
            LightWire.pack(new JSONDocument({ fields, id, sub }));
          },
          changed: (id, fields, documentCacheId) => {
            LightWire.pack(new JSONDocument({ fields, id, sub }));
          },
          removed: (id, documentCacheId) => {
            LightWire.pack(new JSONDocument({ id, sub }));
          },
        });
      } else {
        ret = LWCollection.collections[sub].find({ meetingId }).observeChanges({
          added: (id, fields) => {},
          changed: (id, fields) => {},
          removed: (id) => {},
        });
      }
      fakeObservers[meetingId][fakeCount].push(ret);
    });

    fakeMeetingCount[meetingId]++;
  }
}
function debugRemoveFake(meetingId, count) {
  fakeMeetingCount[meetingId] = fakeMeetingCount[meetingId] || 1;
  fakeObservers[meetingId] = fakeObservers[meetingId] || {};
  for (let i = 0; fakeMeetingCount[meetingId] > 1 && i < count; i++) {
    fakeMeetingCount[meetingId]--;
    const id = `w_fake${10000000 + fakeMeetingCount[meetingId]}`;
    fakeObserbers[meetingId][fakeMeetingCount[meetingId]].forEach(observer => observer.stop());
    delete fakeObserbers[meetingId][fakeMeetingCount[meetingId]];
    LWCollection.collections.users.remove({ intId: id });
    LWCollection.collections.voiceUsers.remove({ intId: id });
  }
}


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
    this._allowRead = function () { return false; };
    this._allowWrite = function () { return false; };
    this._allowEmit = function () { return true; };

    this._members = {};
  }

  allowRead(func) {
    this._allowRead = func;
  }

  allowWrite(func) {
    this._allowWrite = func;
  }

  allowEmit(func) {
    this._allowEmit = func;
  }

  stop() {
    delete StreamerCentral.instances[this._name];
    this._stopped = true;
  }

  _join(conn) {
    this._members[conn._id] = conn;
  }

  _leave(conn) {
    delete this._members[conn._id];
  }

  _incoming(conn, doc) {
    if (doc.code === ChannelDocument.code) this._emitter.emit(doc.event, conn, doc.doc);
    else {
      const obj = makeObj(doc);
      delete obj.channel;
      delete obj._event;
      this._emitter.emit(doc._event, conn, obj);
    }
  }

  on(event, func) {
    const wrapFunc = (conn, payload) => {
      const invocation = {
        userId: conn.userId,
        connection: conn,
      };

      func.call(invocation, payload);
    };

    return this._emitter.on(event, wrapFunc);
  }

  emit(event, payload) {
    const dclass = channelDocuments[event];
    let cdoc;
    if (dclass) {
      cdoc = makeDoc(dclass, payload);
      cdoc.channel = this._name;
    } else cdoc = new ChannelDocument(this._name, event, payload);


    for (const id in this._members) {
      const member = this._members[id];
      if (member._socket.readyState !== 1) // not open
      { delete this._members[member._id]; } else member.send(cdoc);
    }
  }
};

/* const LWCollection = class LWCollection extends Mongo.Collection {
  constructor(name){
    //super(name, {connection:null});
    //super(null);
    super(name);
    collections[name] = this;
    this._collection._lwname = name;

    this._nextId = instanceId;
    this._makeNewID = () => {return (this._nextId+=instanceMax).toString()};
  }

  //_ensureIndex(...args){
    //_debug.log(`LWCollection ignoring _ensureIndex for collection ${this._collection._lwname}`)
  //}
} */

const LWSubscription = class LWSubscription {
  constructor(conn, subName, subId, handler, ...args) {
    this.connection = conn;
    this._subName = subName;
    this._handler = handler;
    this._args = [...args];
    this._id = subId;
    this.userId = conn.userId;

    this._nextHighId = 2 ** 31;
    this._stringToId = {};
    this._knownDocs = {};
    this._collName = null;

    this._ready = false;
    this._stopped = false;
    this._onStop = null;
    this._observer = null;

    const ret = handler.call(this, ...args);
    // if (ret && ret.observeChanges && ret.collection._lwname){
    if (ret && ret.observeChanges && ret._cursorDescription && ret._cursorDescription.collectionName) {
      // const collName = ret.collection._lwname;
      const collName = ret._cursorDescription.collectionName;
      this._collName = collName;

      this._observer = ret.observeChanges({
        added: (id, fields, documentCacheId) => {
          if (debugging) _debug.debug('OBSERVE ADDED', subName, collName, id, JSON.stringify(fields));
          this._knownDocs[id] = fields;
          id = parseInt(id) || id;
          this.added(collName, id, fields, documentCacheId);
        },
        changed: (id, fields, documentCacheId) => {
          if (debugging) _debug.debug('OBSERVE CHANGED', subName, collName, id, JSON.stringify(fields));
          id = parseInt(id) || id;
          this.changed(collName, id, fields, documentCacheId);
        },
        removed: (id, documentCacheId) => {
          if (debugging) _debug.debug('OBSERVE REMOVED', subName, collName, id);
          delete this._knownDocs[id];
          id = parseInt(id) || id;
          this.removed(collName, id, documentCacheId);
        },
      });

      this.ready();
    }
  }

  _cleanup() {
    this._stopped = true;
    if (this._observer) this._observer.stop();
    if (this._onStop) this._onStop();
  }

  _rebuild() {
    _debug.debug('REBUILDING sub', this._subName);
    this._cleanup();
    return new LWSubscription(this.connection, this._subName, this._id, this._handler, ...this._args);
  }

  _fixStringId(id) {
    if (typeof id === 'string') {
      if (this._stringToId[id] === undefined) this._stringToId[id] = this._nextHighId++;
      return this._stringToId[id];
    }
    return id;
  }

  added(collection, id, fields, documentCacheId) {
    if (this._stopped) return;
    id = this._fixStringId(id);

    let doc = collectionDocuments[collection];
    if (doc) {
      doc = makeDoc(doc, fields);
      doc._id = id;
    } else doc = new DefaultAdded(collection, id, fields);

    this.connection.send(doc, documentCacheId);
  }

  changed(collection, id, fields, documentCacheId) {
    if (this._stopped) return;
    id = this._fixStringId(id);

    let doc = collectionDocuments[collection];
    if (doc) {
      doc = makeUpdate(collection, id, doc, fields);
      if (!doc || doc.updates.length === 0) {
        // Don't send a blank update
        return;
      }
    } else doc = new DefaultChanged(collection, id, fields);

    this.connection.send(doc, documentCacheId);
  }

  removed(collection, id, documentCacheId) {
    if (this._stopped) return;
    id = this._fixStringId(id);
    this.connection.send(new DefaultRemoved(collection, id), documentCacheId);
  }

  ready() {
    if (!this._ready) {
      this._ready = true;
      this.connection.send(new MeteorReady(this._id));
    }
  }

  onStop(func) {
    this._onStop = func;
  }

  error(error) {
    _debug.error('Unsubscribe error', error);
    if (this._observer) this._observer.stop();
    this.connection.send(new MeteorUnsubscribe(this._id, error));

    this._cleanup();
  }

  stop() {
    _debug.log('Unsubscribe stop');
    if (this._observer) this._observer.stop();
    this.connection.send(new MeteorUnsubscribe(this._id));

    this._cleanup();
  }
};

const LWMeteorServer = class LWMeteorServer {
  constructor(port) {
    this._port = port || 4100;
    this._methods = {};
    this._subscribeHandlers = {};
    this._subscriptions = {};
  }

  init() {
    const self = this;

    this._server = new LightWire.Server({ port: this._port, debug: debugging });
    LWCollection.Server = this._server;
    this._server.onopen = (conn) => {
      _debug.log('ServerConn ONOPEN');
      userIds[conn._id] = {
        // userId: conn._id.toString(),
        tracker: new Tracker.Dependency(),
        setUserId(userId) {
          // this.userId = userId.toString();
          conn.userId = userId.toString();
          /* const subs = self._subscriptions[conn._id];
          const newsubs = {};
          for (let sub in subs){
            newsubs[sub] = subs[sub]._rebuild();
          }
          self._subscriptions[conn._id] = newsubs; */
          // this.tracker.changed();
        },
      };

      conn.id = conn._id.toString();
      conn.userId = null;

      this._subscriptions[conn._id] = {};
    };

    // re-init methods
    this.methods(this._methods);

    this._server.onclose = (conn) => {
      _debug.log('ServerConn ONCLOSE');
      delete userIds[conn._id];

      const subs = this._subscriptions[conn._id];
      for (const sub in subs) {
        subs[sub]._cleanup();
      }
      delete this._subscriptions[conn._id];
    };

    this._server.onerror = (error) => {
      _debug.log('ServerConn ONERROR', error);
    };


    this._server.on(MeteorCall, Meteor.bindEnvironment((conn, doc) => {
      if (debugging) _debug.log('Inc MeteorCall', JSON.stringify(doc));
      const invocation = {
        isSimulation: false,
        userId: conn.userId,
        setUserId: userIds[conn._id].setUserId,
        unblock() {},
        connection: conn,
        randomSeed: null,
      };

      if (debugging) _debug.log('MeteorCall', doc.method, JSON.stringify(doc.args));
      try {
        self._methods[doc.method].call(invocation, ...doc.args);
        conn.send(new MeteorCallSuccess(doc.requestId));
      } catch (err) {
        _debug.error('ERROR: MeteorCall', doc.method, JSON.stringify(doc.args), err);
        conn.send(new MeteorCallError(doc.requestId, err.stack));
      }
    }));

    this._server.on(MeteorSubscribe, Meteor.bindEnvironment((conn, doc) => {
      if (debugging) _debug.log('Inc MeteorSubscribe', JSON.stringify(doc));
      const sub = new LWSubscription(conn, doc.subName, doc.subId, self._subscribeHandlers[doc.subName], ...doc.args);
      self._subscriptions[conn._id][doc.subId] = sub;
    }));

    this._server.on(MeteorUnsubscribe, Meteor.bindEnvironment((conn, doc) => {
      if (debugging) _debug.log('Inc MeteorUnsubscribe', JSON.stringify(doc));
      const sub = self._subscriptions[conn._id][doc.subId];

      // send removals to client
      for (let id in sub._knownDocs) {
        id = parseInt(id) || id;
        sub.removed(sub._collName, id);
      }

      sub._cleanup();
      delete self._subscriptions[conn._id][doc.subId];
    }));

    this._server.on(JSONDocument, Meteor.bindEnvironment((conn, doc) => { // TEMP
      if (debugging) _debug.log('Inc JSONDocument', JSON.stringify(doc.object));
      // if (doc.object.setauthcredentials){                                //TEMP
      // conn.credentials = doc.object.setauthcredentials;
      // }
      const obj = doc.object;
      if (allowFakeClients && obj.command) {
        switch (obj.command) {
          case 'createFake':
            _debug.log(`CreateFake${obj.count}`);
            debugCreateFake(obj.meetingId, obj.count);
            break;
          case 'removeFake':
            _debug.log(`RemoveFake${obj.count}`);
            debugRemoveFake(obj.meetingId, obj.count);
            break;
        }
      }
    }));

    this._server.on(ChannelJoin, Meteor.bindEnvironment((conn, doc) => {
      if (debugging) _debug.log('Inc ChannelJoin', JSON.stringify(doc));
      const channelName = doc.channel;
      const channel = StreamerCentral.instances[channelName];
      if (!channel) {
        _debug.warn(`ChannelJoin sent to non-existent channel '${channelName}'`, JSON.stringify(doc));
        conn.send(new ChannelResult(channelName, `Join sent to non-existent channel '${channelName}'`));
      } else {
        channel._join(conn);
      }
    }));

    this._server.on(ChannelLeave, Meteor.bindEnvironment((conn, doc) => {
      if (debugging) _debug.log('Inc ChannelLeave', JSON.stringify(doc));
      const channelName = doc.channel;
      const channel = StreamerCentral.instances[channelName];
      if (!channel) {
        _debug.warn(`ChannelLeave sent to non-existent channel '${channelName}'`, JSON.stringify(doc));
        conn.send(new ChannelResult(channelName, `Leave sent to stopped/non-existent channel '${channelName}'`));
      } else {
        channel._leave(conn);
      }
    }));

    this._server.on(ChannelDocument, Meteor.bindEnvironment((conn, doc) => {
      if (debugging) _debug.log('Inc ChannelDocument', JSON.stringify(doc));
      const channelName = doc.channel;
      const channel = StreamerCentral.instances[channelName];
      if (!channel) {
        _debug.warn(`ChannelDocument sent to non-existent channel '${channelName}'`, JSON.stringify(doc));
        conn.send(new ChannelResult(channelName, `Document sent to non-existent channel '${channelName}'`));
      } else {
        channel._incoming(conn, doc);
      }
    }));

    for (const eventName in channelDocuments) {
      _debug.log(`Starting channel listener for ${eventName}`);
      const channelDoc = channelDocuments[eventName];
      this._server.on(channelDoc, Meteor.bindEnvironment((conn, doc) => {
        const channelName = doc.channel;
        const channel = StreamerCentral.instances[channelName];
        if (!channel) {
          _debug.warn(`Channel document '${doc._event}' sent to non-existent channel '${channelName}'`, JSON.stringify(doc));
          conn.send(new ChannelResult(channelName, `Channel document '${doc._event}' sent to non-existent channel '${channelName}'`));
        } else {
          channel._incoming(conn, doc);
        }
      }));
    }
  }

  status() {
  }

  call(method, ...args) {
  }

  methods(methods) {
    for (const method in methods) {
      if (!this._server) break;

      const dclass = methodDocuments[method];
      const func = methods[method];
      if (dclass) {
        if (this._methods[method]) this._server.off(dclass, this._methods[method]);

        methods[method] = this._server.on(dclass, Meteor.bindEnvironment((conn, doc) => {
          _debug.log('Inc METHOD', doc);
          const invocation = {
            isSimulation: false,
            userId: conn.userId,
            setUserId: userIds[conn._id].setUserId,
            unblock() {},
            connection: conn,
            randomSeed: null,
          };

          const requestId = doc._requestId;
          delete doc._requestId;
          try {
            func.call(invocation, makeArgs(doc));
            conn.send(new MeteorCallSuccess(requestId));
          } catch (err) {
            _debug.error('ERROR: MethodDocument', doc.method, JSON.stringify(doc), err);
            conn.send(new MeteorCallError(requestId, err.stack));
          }
        }));
      }
    }

    this._methods = { ...this._methods, ...methods };
  }

  subscribe() {

  }

  publish(name, func) {
    this._subscribeHandlers[name] = func;
  }

  disconnect() {
  }

  reconnect() {
  }
};

const LWMeteorSingleton = new LWMeteorServer(4099 + instanceId);
LWMeteorSingleton.Collection = LWCollection;
LWMeteorSingleton.StreamerCentral = StreamerCentral;
LWMeteorSingleton.Streamer = LWStreamer;

Meteor.startup(() => {
  debugging = Meteor.settings.private.lightwire.debug || false;
  allowFakeClients = Meteor.settings.private.lightwire.allowFakeClients || false;
  LWCollection.debugging = Meteor.settings.private.lightwire.collectionDebug || false;
  LWMeteorSingleton.init();
});


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


export const addLightWireMeeting = (meetingId) => {
  const cacheSet = new LightWire.CacheSet(meetingId, false);
  cacheSet.addCacheString(meetingId);
  _debug.info(`Add LightWire CacheSet '${meetingId}'`);
  LWMeteorSingleton._server.addCacheSet(cacheSet);
};

export const clearLightWireMeeting = (meetingId) => {
  _debug.info(`Clear LightWire CacheSet '${meetingId}'`);
  LWMeteorSingleton._server.removeCacheSet(meetingId);
};

export { LightWire, LWMeteorSingleton as LWMeteor };
