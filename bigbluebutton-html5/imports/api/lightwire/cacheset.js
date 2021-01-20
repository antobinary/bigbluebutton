import { LightWire, Document, Types } from "./lightwire";
import { TextDecoder as TD, TextEncoder as TE} from 'util';

TextDecoder = (typeof TD !== "undefined") ? TD : TextDecoder;
TextEncoder = (typeof TE !== "undefined") ? TE : TextEncoder;

const dec = new TextDecoder('utf-8');
let decodeString = (buffer, offset, length) => {
  return dec.decode(new DataView(buffer, offset, length));
}

const enc = new TextEncoder('utf-8');
let encodeString = (string) => {
  return enc.encode(string);
}

if (typeof Buffer !== "undefined"){
  decodeString = (buffer, offset, length) => {
    return Buffer.from(buffer, offset, length).toString('utf-8');
  }

  encodeString = (string) => {
    return Buffer.from(string, "utf-8");
  }
}

export const CacheSet = class CacheSet{
  constructor(name, passive){
    this._name = name;
    this._passive = (passive === false) ? false : true;
    this._currentCode = 1;
    this._codeToString = {};
    this._stringToCode = {};
    this._documentCache = {};
    this._lengthLimit = 1024;
  }

  _getCacheCode = (string) => {
    if (string.length > this._lengthLimit)
      return 0;

    let code = this._stringToCode[string];
    if (code)
      return code;
    else if (this._passive)
      return 0;

    code = this._currentCode++;
    this._codeToString[code] = string;
    this._stringToCode[string] = code;
    return code;
  }

  _getCacheString = (code) => {
    return this._codeToString[code];
  }

  _setCacheString = (index, string) => {
    this._codeToString[index] = string;
    this._stringToCode[string] = index;
  }

  _clearCache = () =>  {
    this._currentCode = 1;
    this._codeToString = {};
    this._stringToCode = {};
  }

  addCacheString = (string) => {
    return this._getCacheCode(string);
  }

  clearDocumentCache = () => {
    this._documentCache = {};
  }

  get name(){ return this._name };
  get index(){ return this._currentCode};

  pack(msgs, documentCacheId) {
    if (documentCacheId && this._documentCache[documentCacheId]){
      return this._documentCache[documentCacheId];
    }

    if (!Array.isArray(msgs)) {
      msgs = [msgs];
    }
    const meta = {};
    let length = 0;
    for (let m=0, mlen=msgs.length; m<mlen; m++){
      const msg = msgs[m];
      if (msg === null || msg === undefined){
        length += 2;
        continue;
      }

      length += 2 + msg._length; // code + fixed
      if (msg._isVarLength){
        length += 4; // code+length
        meta[m] = {_varlength: 0};
        const schema = LightWire._schemas.get(msg.code);
        for (let pi=0, plen=schema.length; pi<plen; pi++){
          const prop = schema[pi];
          const p = msg[prop.name];
          let s, code;
          if (Array.isArray(prop.type)){
            if (p === undefined || p === null){
              meta[m][prop.name + '_bytes'] = null;
            }
            else {
              s = this.pack(p);
              meta[m][prop.name + '_bytes'] = s;
              meta[m]._varlength += s.byteLength;
              length += s.byteLength;
            }
          }
          else if (LightWire.isDocument(prop.type)){
            if (prop.type._isVarLength){
              if (p === undefined || p === null){
                length += 6;
                meta[m]._varlength += 6;
              }
              else {
                s = this.pack(p);
                meta[m][prop.name + '_bytes'] = s;
                meta[m]._varlength += s.byteLength;
                length += s.byteLength;
              }
            }
            else {
              //length += 2 + prop.type._length;
              //meta[m]._varlength += 2 + prop.type._length;
            }
          }
          else {
            switch (prop.type){
              case 'cs':
                if (p === undefined || p === null){
                  meta[m][prop.name + '_code'] = null;
                }
                else {
                  code = this._getCacheCode(p);
                  meta[m][prop.name + '_code'] = code;
                  if (code === 0){
                    s = encodeString(p);
                    if (s.length >= 1<<17-1)
                      throw "Error: Pack -- string length exceeded for '" + prop.name + "', length: " + s.length;
                    meta[m][prop.name + '_bytes'] = s;
                    meta[m]._varlength += s.length;
                    length += s.length;
                  }
                }
                break;
              case 'str':
                if (p === undefined || p === null){
                  meta[m][prop.name + '_bytes'] = null;
                }
                else {
                  s = encodeString(p);
                  if (s.length >= 1<<17-1)
                    throw "Error: Pack -- string length exceeded for '" + prop.name + "', length: " + s.length;
                  meta[m][prop.name + '_bytes'] = s;
                  meta[m]._varlength += s.length;
                  length += s.length;
                }
                break;
              case 'astr':
                if (p === undefined || p === null){
                  meta[m][prop.name + '_bytes'] = null;
                }
                else {
                  meta[m][prop.name + '_bytes'] = [];
                  meta[m][prop.name + '_length'] = 0;
                  for (let ai=0, alen=p.length; ai<alen; ai++){
                    if (p[ai] === null){
                      meta[m][prop.name + '_bytes'].push(null);
                      meta[m]._varlength += 2;
                      length += 2;
                      meta[m][prop.name + '_length'] += 2;
                    }
                    else {
                      s = encodeString(p[ai]);
                      if (s.length >= 1<<17-1)
                        throw "Error: Pack -- string length exceeded for '" + prop.name + "', length: " + s.length;
                      meta[m][prop.name + '_bytes'].push(s);
                      meta[m]._varlength += s.length + 2;
                      length += s.length + 2;
                      meta[m][prop.name + '_length'] += s.length + 2;
                    }
                  }
                }
                break;
              case 'o':
                if (p === null || p === undefined){
                  meta[m][prop.name + '_bytes'] = null;
                }
                else {
                  s = encodeString(JSON.stringify(p));
                  if (s.length >= 1<<17-1)
                    throw "Error: Pack -- object json length exceeded for '" + prop.name + "', length: " + s.length;
                  meta[m][prop.name + '_bytes'] = s;
                  meta[m]._varlength += s.length;
                  length += s.length;
                }
                break;
              case 'ao':
                if (p === null || p === undefined){
                  meta[m][prop.name + '_bytes'] = null;
                }
                else {
                  s = encodeString(JSON.stringify(p));
                  meta[m][prop.name + '_bytes'] = s;
                  meta[m]._varlength += s.length;
                  length += s.length;
                }
                break;
              case 'lw':
              case 'alw':
                if (p === undefined || p === null){
                  meta[m][prop.name + '_bytes'] = null;
                }
                else {
                  s = this.pack(p);
                  meta[m][prop.name + '_bytes'] = s;
                  meta[m]._varlength += s.byteLength;
                  length += s.byteLength;
                }
                break;
              case 'af':
              case 'ad':
              case 'ab':
              case 'aub':
              case 'as':
              case 'aus':
              case 'ai':
              case 'aui':
                if (p === undefined || p === null){
                  meta[m][prop.name + '_bytes'] = null;
                }
                else {
                  switch(prop.type){
                    case 'af':
                      s = new Float32Array(p);
                      break;
                    case 'ad':
                      s = new Float64Array(p);
                      break;
                    case 'ab':
                      s = new Int8Array(p);
                      break;
                    case 'aub':
                      s = new Uint8Array(p);
                      break;
                    case 'as':
                      s = new Int16Array(p);
                      break;
                    case 'aus':
                      s = new Uint16Array(p);
                      break;
                    case 'ai':
                      s = new Int32Array(p);
                      break;
                    case 'aui':
                      s = new Uint32Array(p);
                      break;
                  }
                  meta[m][prop.name + '_bytes'] = s;
                  meta[m]._varlength += s.byteLength;
                  length += s.byteLength;
                }
                break;
            }
          }
        }
      }
    }

    let offset = 0;
    const ab = new ArrayBuffer(length);
    const ab8 = new Uint8Array(ab);
    const dv = new DataView(ab);
    for (let m=0, mlen=msgs.length; m<mlen; m++){
      const msg = msgs[m];
      if (msg === null || msg === undefined){
        offset += 2;
        continue;
      }

      dv.setUint16(offset, msg.code, false);
      offset += 2;
      if (msg._isVarLength){
        dv.setUint32(offset, msg._length + meta[m]._varlength, false);
        //dv.setUint32(offset, msg._length + msg._varlength, false);
        offset += 4;
      }

      const schema = LightWire._schemas.get(msg.code);

      for (let pi=0, plen=schema.length; pi<plen; pi++){
        const prop = schema[pi];
        const p = msg[prop.name];
        if (Array.isArray(prop.type)){
          let s = meta[m][prop.name + '_bytes'];
          if (s === null){
            dv.setUint32(offset, 0xFFFFFFFF, false);
            offset += 4;
          }
          else {
            s = new Uint8Array(s);
            dv.setUint32(offset, s.length, false);
            ab8.set(s, offset+4);
            offset += 4 + s.length;
          }
        }
        else if (LightWire.isDocument(prop.type)){
          if (p === undefined || p === null){
            //dv.setUint16(offset, 0, false);
            offset += 2;
            if (prop.type._isVarLength){
              //dv.setUint32(offset, 0, false);
              offset += 4;
            }
            else {
              offset += prop.type._length; // fixed length
            }
          }
          else {
            let s;
            if (prop.type._isVarLength)
              s = new Uint8Array(meta[m][prop.name + '_bytes']);
            else
              s = new Uint8Array(this.pack(msg[prop.name]));

            ab8.set(s, offset);
            offset += s.length;
          }
        }
        else {
          let s, code;
          switch(prop.type){
            case 'cs':
              code = meta[m][prop.name + '_code'];
              if (code === null){
                dv.setUint32(offset, 0xFFFFFFFF, false);
                offset += 4;
              }
              else if (code === 0){
                s = meta[m][prop.name + '_bytes'];
                dv.setUint32(offset, 0xFFFF0000 + s.length, false);
                ab8.set(s, offset+4);
                offset += 4 + s.length;
              }
              else {
                dv.setUint32(offset, code, false);
                offset += 4;
              }
              break;
            case 'v2':
              dv.setFloat32(offset, p.x, false);
              dv.setFloat32(offset+4, p.y, false);
              offset += 8;
              break;
            case 'v3':
              dv.setFloat32(offset, p.x, false);
              dv.setFloat32(offset+4, p.y, false);
              dv.setFloat32(offset+8, p.z, false);
              offset += 12;
              break;
            case 'str':
            case 'o':
              s = meta[m][prop.name + '_bytes'];
              if (s === null){
                dv.setUint16(offset, 0xFFFF, false);
                offset += 2;
              }
              else {
                dv.setUint16(offset, s.length, false);
                ab8.set(s, offset+2);
                offset += 2 + s.length;
              }
              break;
            case 'astr':
              let bytesArray = meta[m][prop.name + '_bytes'];
              if (bytesArray === null){
                dv.setUint32(offset, 0xFFFFFFFF, false);
                offset += 4;
              }
              else {
                dv.setUint32(offset, meta[m][prop.name + '_length'], false);
                offset += 4;
                for (let ai=0, alen=bytesArray.length; ai<alen; ai++){
                  s = bytesArray[ai];
                  if (s === null){
                    dv.setUint16(offset, 0xFFFF, false);
                    offset += 2;
                  }
                  else{
                    dv.setUint16(offset, s.length, false);
                    ab8.set(s, offset+2);
                    offset += 2 + s.length;
                  }
                }
              }
              break;
            case 'ao':
              s = meta[m][prop.name + '_bytes'];
              if (s === null){
                dv.setUint32(offset, 0xFFFFFFFF, false);
                offset += 4;
              }
              else {
                dv.setUint32(offset, s.length, false);
                ab8.set(s, offset+4);
                offset += 4 + s.length;
              }
              break;
            case 'lw':
            case 'alw':
              s = meta[m][prop.name + '_bytes'];
              if (s === null){
                dv.setUint32(offset, 0xFFFFFFFF, false);
                offset += 4;
              }
              else {
                s = new Uint8Array(s);
                dv.setUint32(offset, s.length, false);
                ab8.set(s, offset+4);
                offset += 4 + s.length;
              }
              break;
            case 'f':
              dv.setFloat32(offset, p, false);
              offset += 4;
              break;
            case 'd':
              dv.setFloat64(offset, p, false);
              offset += 8;
              break;
            case 'b':
              dv.setInt8(offset, p, false);
              offset += 1;
              break;
            case 'ub':
            case 'bool':
              dv.setUint8(offset, p, false);
              offset += 1;
              break;
            case 's':
              dv.setInt16(offset, p, false);
              offset += 2;
              break;
            case 'us':
              dv.setUint16(offset, p, false);
              offset += 2;
              break;
            case 'i':
              dv.setInt32(offset, p, false);
              offset += 4;
              break;
            case 'ui':
              dv.setUint32(offset, p, false);
              offset += 4;
              break;
            case 'af':
            case 'ad':
            case 'ab':
            case 'aub':
            case 'as':
            case 'aus':
            case 'ai':
            case 'aui':
              s = meta[m][prop.name + '_bytes'];
              if (s === null){
                dv.setUint32(offset, 0xFFFFFFFF, false);
                offset += 4;
              }
              else {
                s = meta[m][prop.name + '_bytes'];
                s = new Uint8Array(s.buffer);
                dv.setUint32(offset, s.length, false);
                ab8.set(s, offset+4);
                offset += 4 + s.length;
              }
              break;
          }
        }
      }
    }

    if (documentCacheId){
      this._documentCache[documentCacheId] = ab;
    }
    return ab;
  }

  unpack(arrayBuffer, baseOffset, bufferLength){
    baseOffset = baseOffset || 0;
    let offset = 0;
    bufferLength = (bufferLength===undefined) ? arrayBuffer.byteLength : bufferLength;
    const msgs = [];

    const dv = new DataView(arrayBuffer, baseOffset, bufferLength);
    while (offset < bufferLength){
      const code = dv.getUint16(offset, false);
      offset += 2;

      if (code === 0){
        msgs.push(null);
        continue;
      }

      const mclass = LightWire._documents.get(code);
      const schema = LightWire._schemas.get(code);
      if (!mclass){ console.error("Invalid Document Code: " + code); continue;}
      if (!schema){ console.error("Invalid Schema for Code: " + code); continue;}

      let length = mclass._length;
      if (mclass._isVarLength){
        length = dv.getUint32(offset, false);
        offset += 4;
      }

      const obj = new mclass();
      msgs.push(obj);

      if (length === 0)
        continue;

      for (let pi=0, plen=schema.length; pi<plen; pi++){
        const prop = schema[pi];
        let len, len2, max, cacheCode;
        if (Array.isArray(prop.type)){
          len = dv.getUint32(offset,false)
          offset += 4;
          if (len === 0xFFFFFFFF){
            obj[prop.name] = null;
          }
          else {
            obj[prop.name] = this.unpack(arrayBuffer, offset+baseOffset, len);
            offset += len;
          }
        }
        else if (LightWire.isDocument(prop.type)){
          let nextCode = dv.getUint16(offset,false);
          if (prop.type._isVarLength)
            len = dv.getUint32(offset+2,false) + 6;
          else
            len = prop.type._length + 2;

          if (nextCode === 0) // null object
            obj[prop.name] = null;
          else
            obj[prop.name] = this.unpack(arrayBuffer, offset+baseOffset, len)[0];
          offset += len;
        }
        else {
          switch(prop.type){
            case 'cs':
              cacheCode = dv.getUint32(offset, false);
              offset += 4;
              if (cacheCode === 0xFFFFFFFF){
                obj[prop.name] = null;
              }
              else if (cacheCode >= 0xFFFF0000){
                len = cacheCode - 0xFFFF0000;
                obj[prop.name] = decodeString(arrayBuffer, offset+baseOffset, len);
                offset += len;
                if (!this._passive)
                  this._getCacheCode(obj[prop.name]);
              }
              else {
                obj[prop.name] = this._getCacheString(cacheCode);
              }
              break;
            case 'v2':
              obj[prop.name] = {x: dv.getFloat32(offset, false), y: dv.getFloat32(offset+4, false)} ;
              offset += 8;
              break;
            case 'v3':
              obj[prop.name] = {x: dv.getFloat32(offset, false), y: dv.getFloat32(offset+4, false), z: dv.getFloat32(offset+8, false)} ;
              offset += 12;
              break;
            case 'str':
              len = dv.getUint16(offset, false);
              offset += 2;
              if (len === 0xFFFF){
                obj[prop.name] = null;
              }
              else{
                obj[prop.name] = decodeString(arrayBuffer, offset+baseOffset, len);
                offset += len;
              }
              break;
            case 'astr':
              len = dv.getUint32(offset, false);
              offset += 4;
              max = len+offset;
              if (len === 0xFFFFFFFF){
                obj[prop.name] = null;
              }
              else{
                obj[prop.name] = [];
                while (offset < max){
                  len2 = dv.getUint16(offset, false);
                  offset += 2;
                  if (len2 === 0xFFFF){
                    obj[prop.name] = null;
                  }
                  else{
                    obj[prop.name].push(decodeString(arrayBuffer, offset+baseOffset, len2));
                    offset += len2;
                  }
                }
              }
              break;
            case 'o':
              len = dv.getUint16(offset, false);
              offset += 2;
              if (len === 0xFFFF){
                obj[prop.name] = null;
              }
              else {
                obj[prop.name] = JSON.parse(decodeString(arrayBuffer, offset+baseOffset, len));
                offset += len;
              }
              break;
            case 'ao':
              len = dv.getUint32(offset, false);
              offset += 4;
              if (len === 0xFFFFFFFF){
                obj[prop.name] = null;
              }
              else {
                obj[prop.name] = JSON.parse(decodeString(arrayBuffer, offset+baseOffset, len));
                offset += len;
              }
              break;
            case 'lw':
              len = dv.getUint32(offset, false);
              offset += 4;
              if (len === 0xFFFFFFFF){
                obj[prop.name] = null;
              }
              else {
                obj[prop.name] = this.unpack(arrayBuffer, offset+baseOffset, len)[0];
                offset += len;
              }
              break;
            case 'alw':
              len = dv.getUint32(offset, false);
              offset += 4;
              if (len === 0xFFFFFFFF){
                obj[prop.name] = null;
              }
              else {
                obj[prop.name] = this.unpack(arrayBuffer, offset+baseOffset, len);
                offset += len;
              }
              break;
            case 'f':
              obj[prop.name] = dv.getFloat32(offset, false);
              offset += 4;
              break;
            case 'd':
              obj[prop.name] = dv.getFloat64(offset, false);
              offset += 8;
              break;
            case 'b':
              obj[prop.name] = dv.getInt8(offset, false);
              offset += 1;
              break;
            case 'ub':
              obj[prop.name] = dv.getUint8(offset, false);
              offset += 1;
              break;
            case 'bool':
              obj[prop.name] = !!dv.getUint8(offset, false);
              offset +=1 ;
              break;
            case 's':
              obj[prop.name] = dv.getInt16(offset, false);
              offset += 2;
              break;
            case 'us':
              obj[prop.name] = dv.getUint16(offset, false);
              offset += 2;
              break;
            case 'i':
              obj[prop.name] = dv.getInt32(offset, false);
              offset += 4;
              break;
            case 'ui':
              obj[prop.name] = dv.getUint32(offset, false);
              offset += 4;
              break;
            case 'af':
            case 'ad':
            case 'ab':
            case 'aub':
            case 'as':
            case 'aus':
            case 'ai':
            case 'aui':
              len = dv.getUint32(offset, false);
              offset += 4;
              if (len === 0xFFFFFFFF){
                obj[prop.name] = null;
              }
              else {
                switch(prop.type){
                  case 'af':
                    obj[prop.name] = Array.from(new Float32Array(arrayBuffer.slice(offset+baseOffset, offset+baseOffset+len)));
                    break;
                  case 'ad':
                    obj[prop.name] = Array.from(new Float64Array(arrayBuffer.slice(offset+baseOffset, offset+baseOffset+len)));
                    break;
                  case 'ab':
                    obj[prop.name] = Array.from(new Int8Array(arrayBuffer, offset+baseOffset, len  ));
                    break;
                  case 'aub':
                    obj[prop.name] = Array.from(new Uint8Array(arrayBuffer, offset+baseOffset, len  ));
                    break;
                  case 'as':
                    obj[prop.name] = Array.from(new Int16Array(arrayBuffer.slice(offset+baseOffset, offset+baseOffset+len)));
                    break;
                  case 'aus':
                    obj[prop.name] = Array.from(new Uint16Array(arrayBuffer.slice(offset+baseOffset, offset+baseOffset+len)));
                    break;
                  case 'ai':
                    obj[prop.name] = Array.from(new Int32Array(arrayBuffer.slice(offset+baseOffset, offset+baseOffset+len)));
                    break;
                  case 'aui':
                    obj[prop.name] = Array.from(new Uint32Array(arrayBuffer.slice(offset+baseOffset, offset+baseOffset+len)));
                    break;
                }
                offset += len;
              }
              break;
          }
        }
      }
    }

    return msgs;
  }
}

export default CacheSet;
