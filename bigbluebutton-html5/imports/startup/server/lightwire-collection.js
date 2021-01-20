import { Meteor } from 'meteor/meteor';
import _ from 'lodash';
import { unflatten } from 'flat';

const collections = {};

_debug = {
  debug: (...args) => {if (LWCollection.debugging) console.debug("[LW-Collection]", ...args);},
  log:   (...args) => {if (LWCollection.debugging) console.log("[LW-Collection]", ...args);},
  info:  (...args) => {console.info("[LW-Collection]", ...args);},
  warn:  (...args) => {console.warn("[LW-Collection]", ...args);},
  error: (...args) => {console.error("[LW-Collection]", ...args);}
}


const Cursor = class Cursor{
  constructor(collection, selector, result){
    this._collection = collection;
    this._selector = selector;
    this._result = result;
    this._cursorDescription = {collectionName: collection._lwname};
    this._observerId = -1;
    this._knownDocs = {};
  }

  fetch(){
    return this._result;
  }
  count(){
    return _.size(this._result);
  }
  forEach(fun, bindThis){
    if (bindThis !== undefined) fun = fun.bind(bindThis);
    return this._result.forEach(fun);
  }
  map(fun, bindThis){
    if (bindThis !== undefined) fun = fun.bind(bindThis);
    return this._result.map(fun);
  }
  observe(callbacks){
    //Add for record meeting or something
  }
  observeChanges(callbacks){
    // set up registration with collection..

    this._collection._startObserver(this, callbacks);
    // call .added for _result
    if (callbacks.added){
      this._result.forEach((doc) => {
        this._knownDocs[doc._id] = doc;
        callbacks.added(doc._id, doc)
      });
    }

    const stop = () => {return this._collection._stopObserver(this)};
    return {stop};
  }
}

const LWCollection = class LWCollection{
  constructor(name){
    //super(name);
    collections[name] = this;
    this._data = {};
    this._lwname = name;
    this._observers = {added:{}, changed:{}, removed:{}};

    this._nextId = 1;
    this._nextObserverId = 1;
  }

  _makeNewID = () => {return (this._nextId++).toString()};
  _startObserver(cursor, callbacks){
    const nextId = this._nextObserverId++;
    cursor._observerId = nextId;
    const selector = _.iteratee(cursor._selector);

    if (callbacks.added){
      this._observers.added[nextId] = {selector, fun:(id, doc) => {
          cursor._knownDocs[id] = doc;
          callbacks.added(id, doc, 1);
        }};
    }
    if (callbacks.changed){
      this._observers.changed[nextId] = {selector, fun:(id, doc) => {
          const match = selector(this._data[id]);
          if (match){
            if (!cursor._knownDocs[id] && callbacks.added){
              cursor._knownDocs[id] = this._data[id];
              callbacks.added(id, this._data[id], 1);
            }
            else{
              callbacks.changed(id, doc, 2);
            }
          }
          else if (cursor._knownDocs[id]){
            // was in set previously but no longer matches
            delete cursor._knownDocs[id];
            callbacks.removed(id, 3);
          }
        }};
    }
    if (callbacks.removed){
      this._observers.removed[nextId] = {selector, fun:(id) => {
          delete cursor._knownDocs[id];
          callbacks.removed(id, 1);
        }};
    }
  }
  _stopObserver(cursor){
    delete this._observers.added[cursor._observerId];
    delete this._observers.changed[cursor._observerId];
    delete this._observers.removed[cursor._observerId];
  }

  _ensureIndex(...args){
    //_debug.log(`LWCollection ignoring _ensureIndex for collection ${this._collection._lwname}`)
  }

  _find(selector){
    if (typeof(selector) === "string"){
      const found = this._data[selector]
      if (LWCollection.debugging) _debug.debug("lw-coll: find " + this._lwname + " --", JSON.stringify(selector), ' -- ', JSON.stringify(found));
      if (found)
        return [found];
      else
        return found;
    }
    else {
      const found = _.filter(this._data, selector);
      if (LWCollection.debugging) _debug.debug("lw-coll: find " + this._lwname + " --", JSON.stringify(selector), ' -- ', JSON.stringify(found));
      return found;
    }
  }
  find(selector){
    const found = this._find(selector);
    return new Cursor(this, selector, found);
  }
  findOne(...args){
    const found = this._find(...args);
    return found.length === 0 ? undefined : found[0];
  }


  insert(doc, cb){
    if (LWCollection.debugging) _debug.debug("lw-coll: insert " + this._lwname + " -- ", JSON.stringify(doc));
    const cbFunc = typeof(cb) === "function";
    if (doc._id !== undefined && this._data[doc._id] !== undefined){
      const errorMsg = `Attempted to insert duplicate id '${doc._id}' for collection '${this._lwname}'`;
      if (cbFunc)
        cbFunc(errorMsg);
      else
        throw new Error(errorMsg);
    }
    if (doc._id === undefined) {
      doc._id = this._makeNewID();
    }


    this._data[doc._id] = doc;
    // trigger watches
    _.forEach(this._observers.added, ({selector, fun}) => {
      if (selector(doc)) fun(doc._id, doc);
    });
    LWCollection.Server._clearDirtyCaches();

    if (cbFunc){
      cb(null, doc._id);
    }

    return doc._id;
  }
  update(selector, mutator, options, cb){
    if (LWCollection.debugging) _debug.debug("lw-coll: update " + this._lwname + " --", JSON.stringify(selector), ' -- ', JSON.stringify(mutator));
    if (typeof(options) === "function"){
      cb = options;
      options = {};
    }
    const cbFunc = typeof(cb) === "function";
    if (typeof(options) !== "object")
      options = {};

    let found = this._find(selector);
    let numAffected = found.length;
    if (!options.multi && numAffected>0){
      found = [found[0]];
      numAffected = 1;
    }
    if (typeof(mutator) === "function"){
      numAffected = 0;
      found.forEach((doc) => {
        const result = mutator(doc);
        if (typeof(result) === "object"){
          numAffected++;
          this._data[doc._id] = {...this._data[doc._id], ...result};
          // trigger watches
          _.forEach(this._observers.changed, ({selector, fun}) => {
            // always call func so we can do extra checks for deletion etc
            fun(doc._id, result);
          });
        }
      });
      LWCollection.Server._clearDirtyCaches();
    }
    else{
      // mongodb mutator fix
      if (mutator.$set)
        mutator = mutator.$set;
      mutator = unflatten(mutator);

      found.forEach((doc) => {
        this._data[doc._id] = {...this._data[doc._id], ...mutator};
        // trigger watches
        _.forEach(this._observers.changed, ({selector, fun}) => {
          if (selector(doc)) fun(doc._id, mutator);
        });
      });
      LWCollection.Server._clearDirtyCaches();
    }

    if (numAffected===0 && options.upsert && typeof(mutator) === "object"){
      const newId = this.insert({...selector, ...mutator});
      const ret =  {numberAffected: 1, insertedId: newId};
      if (cbFunc){cb(null, ret)};
      return ret;
    }
    else{
      if (cbFunc){cb(null, numAffected)};
      return numAffected;
    }
  }
  upsert(selector, mutator, options, cb){
    if (typeof(options) === "function"){
      cb = options;
      options = {};
    }
    if (typeof(options) !== "object")
      options = {upsert:true};
    else
      options.upsert = true;
    return this.update(selector, mutator, options, cb);
  }
  remove(selector, cb){
    if (LWCollection.debugging) _debug.debug("lw-coll: remove " + this._lwname + " -- ", JSON.stringify(selector));
    const cbFunc = typeof(cb) === "function";

    if (selector === undefined || selector === null){
      if (cbFunc){
        cb(null, 0);
      }
      return 0;
    }

    const found = this._find(selector);
    found.forEach((f) => delete this._data[f._id]);

    // trigger watches
    _.forEach(this._observers.removed, ({selector, fun}) => {
      found.forEach((doc) => {if (selector(doc)) fun(doc._id)});
    });
    LWCollection.Server._clearDirtyCaches();

    if (cbFunc){
      cb(null, found.length);
    }
    return found.length;
  }
}
LWCollection.Cursor = Cursor;
LWCollection.collections = collections;
LWCollection.debugging = false;

export default LWCollection;
