import WebSocket from 'ws';
import URL from 'url';
import EventEmitter2 from 'eventemitter2';
import { LightWire, Document, Types, JSONDocument, UpdateCacheSet, UseCacheSet } from "./lightwire";

let _debug;

const ServerConnection = class ServerConnection {
  constructor(serverSocket, id, socket, request){
    //_debug.log("NEW ServerConnection",socket,request);
    this._params = URL.parse(request.url, true).query;
    socket.on('message', this._message);
    socket.on('error', this._error);
    socket.on('close', this._close);

    this._emitter = serverSocket._emitter;
    this._socket = socket;
    this._request = request;
    this._id = id;
    this._serverSocket = serverSocket;
    this._cacheSet = serverSocket.getCacheSet(null);
    this._cacheIndex = 1;

    this.onclose = null;
    this.onmessage = null;
    this.onerror = null;
  }

  _message = (data) => {
    _debug.log('received:', data);
    //_debug.log(this._cacheSet._stringToCode);
    const docs = this._cacheSet.unpack(data);
    if (LightWire._debugging) _debug.log('unpack:', JSON.stringify(docs));
    //_debug.log(this._cacheSet._stringToCode);

    let i=0;
    if (docs.length > 0 && docs[0].code === UseCacheSet.code){
      this._cacheSet = this._serverSocket.getCacheSet(docs[0].cacheName);
      this._cacheIndex = Math.max(1,docs[0].startIndex);

      const updateCacheSet = this._getUpdateCacheSet() || new UpdateCacheSet(1, []);
      const packed = this._cacheSet.pack(updateCacheSet);
      this._socket.send(packed);
      this._cacheIndex = updateCacheSet.startIndex + updateCacheSet.strings.length;
      i++;
    }

    for (let ilen=docs.length; i<ilen; i++){
      const doc = docs[i];
      //_debug.log("EMITTING", doc, doc.code, this);
      this._emitter.emit('doc' + doc.code, this, doc);
    }

    if (this.onmessage)
      this.onmessage(this, data);
  }

  _error = (error) => {
    _debug.error('ServerConnection Error:', error);
    if (this.onerror)
      this.onerror(this, error);
  }

  _close = (code, error) => {
    _debug.log('ServerConnection Close, code:', code, ' -- error:', error);
    if (this.onclose)
      this.onclose(this)
  }

  _getUpdateCacheSet = () => {
    const updateCount = this._cacheSet.index - this._cacheIndex;
    if (updateCount === 0)
      return null;

    const strings = new Array(updateCount);
    for (let i=0; i<updateCount; i++){
      strings[i] = this._cacheSet._getCacheString(i+this._cacheIndex);
    }

    return new UpdateCacheSet(this._cacheIndex, strings);
  }

  sendJSON = (object) => {
    this.send(new JSONDocument(object));
  }

  send = (docs, documentCacheId) => {
    if (!Array.isArray(docs))
      docs = [docs];

    if (LightWire._debugging) _debug.log('packing:', JSON.stringify(docs));
    const packed = this._cacheSet.pack(docs, documentCacheId);
    if (documentCacheId)
      this._serverSocket._setDirtyCache(this._cacheSet);

    const updateCacheSet = this._getUpdateCacheSet();
    // Combine packed array buffers into single message?  Memory vs #of messages
    if (updateCacheSet){
      const packUCS = this._cacheSet.pack(updateCacheSet);
      this._socket.send(packUCS);
      this._cacheIndex = updateCacheSet.startIndex + updateCacheSet.strings.length;
    }

    this._socket.send(packed);
  }
}

export const Server = class Server{
  constructor (options){
    options = options || {};
    options = {...{ port: 4100,
        //backlog: ,
        //verifyClient:,
        //path: "/lightwire",
        perMessageDeflate: false,
        //maxPayload: ,
        debug: false,
        debugSocket: false,
    }, ...options};

    _debug = LightWire._debug;
    LightWire._debugging = !!options.debug;
    options.debug = !!options.debugSocket;

    this._emitter = new EventEmitter2();
    this._connections = {};
    this._cacheSets = {};
    this._dirtyCacheSets = {};
    this._nextConnectionId = 1;
    this._serverSocket = new WebSocket.Server(options);

    this._serverSocket.on('error', this._error);
    this._serverSocket.on('headers', this._headers);
    this._serverSocket.on('listening', this._listening);
    this._serverSocket.on('connection', this._connection);

    this.onopen = null;
    this.onclose = null;
    this.onerror = null;
  }

  _error = (error) => {
    _debug.error("WebSocket error:", error);
    if (this.onerror)
      this.onerror(error);
  }

  _headers = (headers, request) => {
    _debug.log("WebSocket headers:", headers); //, request);
  }

  _listening = () => {
    _debug.info("WebSocket Successfully bound");
  }

  _connection = (ws, request) => {
    ws.binaryType = "arraybuffer";
    const connId = this._nextConnectionId++;
    const connection = new ServerConnection(this, connId, ws, request);
    connection.onclose = (connection) => {
      delete this._connections[connection._id];
      if (this.onclose)
        this.onclose(connection);
    }

    this._connections[connId] = connection;
    if (this.onopen)
      this.onopen(connection);
  }


  _getEventName = (event) => {
    if ((typeof event === "object" || typeof event === "function") && event.code)
      return 'doc' + event.code;
    return event;
  }

  _wrapAnyListener = (listener) => {
    return (event, connection, doc) => listener(connection, doc);
  }

  _wrapListener = (listener) => {
    return (connection, doc) => listener(connection, doc);
  }

  _setDirtyCache = (cacheSet) => {
    this._dirtyCacheSets[cacheSet.name] = cacheSet;
  }

  _clearDirtyCaches = () => {
    for (let name in this._dirtyCacheSets){
      this._dirtyCacheSets[name].clearDocumentCache();
    }
    this._dirtyCacheSets = {};
  }

  on = (event, listener) => {
    const wrap = this._wrapListener(listener);
    this._emitter.on(this._getEventName(event), wrap);
    return wrap;
  }

  onAny = (listener) => {
    const wrap = this._wrapAnyListener(listener);
    this._emitter.onAny(wrap);
    return listener;
  }

  off = (event, listener) => {
    return this._emitter.off(this._getEventName(event), listener);
  }

  offAny = (listener) => {
    return this._emitter.offAny(listener);
  }

  once = (event, listener) => {
    const wrap = this._wrapListener(listener);
    this._emitter.once(this._getEventName(event), wrap);
    return wrap;
  }

  many = (event, count, listener) => {
    const wrap = this._wrapListener(listener);
    this._emitter.many(this._getEventName(event), count, wrap);
    return wrap;
  }

  addCacheSet = (cacheSet) => {
    if (this._cacheSets[cacheSet.name]){
      _debug.warn("Warn: Cache set '" + cacheSet.name + "' exists. Not adding.");
      return;
    }
    this._cacheSets[cacheSet.name] = cacheSet;
  }

  getCacheSet = (name) => {
    const cacheSet = this._cacheSets[name];
    return cacheSet || LightWire._defaultCacheSet;
  }

  removeCacheSet = (name) => {
    if (typeof(name) === "object" && name.name)
      name = name.name;
    delete this._cacheSets[name];
  }
}
