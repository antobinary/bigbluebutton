import ReconnectingWebsocket from 'reconnecting-websocket';
//import WebSocket from 'ws';
//import URL from 'url';
import EventEmitter2 from 'eventemitter2';
import { LightWire, Document, Types, JSONDocument, UpdateCacheSet, UseCacheSet } from "./lightwire";

let _debug;

export const Connection = class Connection {
  constructor(url, options){
    // _debug.log("NEW Connection", socket, request);
    // options = options || {};
    options = {...{
      //WebSocket: WebSocket, // default is global websocket
      maxReconnectionDelay: 20000,
      minReconnectionDelay: 1000,
      reconnectionDelayGrowFactor: 1.3,
      //minUptime: 5000,
      //connectionTimeout: 4000,
      maxRetries: 10,
      //maxEnqueuedMessages: Infinity,
      debug: false,
      debugSocket: false,
    }, ...options };

    _debug = LightWire._debug;
    LightWire._debugging = !!options.debug;
    options.debug = !!options.debugSocket;


    this._options = options;
    this._emitter = new EventEmitter2();

    const realMinConnect = options.minReconnectionDelay; // Fix for initial wait instead of 0
    options.minReconnectionDelay = 0;
    this._socket = new ReconnectingWebsocket(url, [], options);
    options.minReconnectionDelay = realMinConnect;
    this._socket._options.minReconnectionDelay = realMinConnect;

    this._socket.binaryType = "arraybuffer";
    this._socket.addEventListener('open', this._open);
    this._socket.addEventListener('message', this._message);
    this._socket.addEventListener('error', this._error);
    this._socket.addEventListener('close', this._close);
    this.onopen = null;
    this.onmessage = null;
    this.onerror = null;
    this.onclose = null;

    this._url = url;
    this._options = options;
    this._cacheSet = options.cacheSet || LightWire._defaultCacheSet;
  }

  _open = (event) => {
    _debug.log("Connection Open:");
    if (this.onopen)
      this.onopen(event);
  }

  _message = (event) => {
    const docs = this._cacheSet.unpack(event.data);

    for (let i=0, ilen=docs.length; i<ilen; i++){
      const doc = docs[i];
      if (doc.code === UpdateCacheSet.code){
        if (doc.startIndex === 1)
          this._cacheSet._clearCache();

        for (let j=0, jlen=doc.strings.length; j<jlen; j++){
          this._cacheSet._setCacheString(doc.startIndex+j, doc.strings[j]);
        }
        this._cacheSet._currentCode = (doc.startIndex+doc.strings.length);
        _debug.log("CACHESET:", this._cacheSet._stringToCode);
      }

      // handle other docs
      //_debug.log("EMITTING", doc, doc.code, this);
      this._emitter.emit('doc' + doc.code, this, doc);
    }

    if (this.onmessage)
      this.onmessage(event);
  }

  _error = (event) => {
    _debug.error('Connection Error:', event.error, event.message);
    if (this.onerror)
      this.onerror(event);
  }

  _close = (event) => {
    _debug.log('Connection Close:', event.code, ' -- reason:', event.reason);
    if (this.onclose)
      this.onclose(event);
  }

  _getEventName = (event) => {
    if ((typeof event === "object" || typeof event === "function") && event.code)
      return 'doc' + event.code;
    return event;
  }

  _wrapAnyListener = (listener) => {
    return (event, connection, doc) => listener.call(connection, doc);
  }

  _wrapListener = (listener) => {
    return (connection, doc) => listener.call(connection, doc);
  }

  reconnect = (code, reason) => {
    this._socket.reconnect(code, reason);
  }
  close = (code, reason) => {
    this._socket.close(code, reason);
  }

  get maxRetries(){return this._socket._maxRetries;}
  get readyState(){return this._socket.readyState;}
  get retryCount(){return this._socket.retryCount;}

  on = (event, listener) => {
    const wrap = this._wrapListener(listener);
    this._emitter.on(this._getEventName(event), wrap);
    return wrap;
  }

  onAny = (listener) => {
    const wrap = this._wrapAnyListener(listener);
    this._emitter.onAny(wrap);
    return wrap;
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

  changeCacheSet = (cacheName) => {
    const ucs = new UseCacheSet(cacheName);
    this.send(ucs);
  }

  sendJSON = (object) => {
    this.send(new JSONDocument(object));
  }

  send = (docs) => {
    const packed = this._cacheSet.pack(docs);

    this._socket.send(packed);
  }
}
