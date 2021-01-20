import { LightWire, Document, Types } from '../lightwire';

export class TestDocument extends Document {
  constructor() {
    super(TestDocument);
    this.__vPos = { x: 0, y: 0 };
    this.__vVel = { x: 0, y: 0 };
    this.__bByte = 0;
    this.__ubByte = 0;
    this.__sShort = 0;
    this.__usShort = 0;
    this.__iInt = 0;
    this.__uiInt = 0;
    this.__fFloat = 0.0;
    this.__dDouble = 0.0;
    this.__strString = '';
  }

  get pos() { return this.__vPos; }

  get vel() { return this.__vVel; }
}
LightWire.registerDocument(TestDocument);

export class TestDocument2 extends Document {
  constructor() {
    super(TestDocument2);
    this.__oObject = {};
  }
}
LightWire.registerDocument(TestDocument2);

export class TestDocument3 extends Document {
  constructor() {
    super(TestDocument3);
    this.height = 0.0;
    this.weight = 0.0;
    this.data = {};
  }

  get schema() { return { height: Types.Float, weight: Types.Float, data: Types.Object }; }
}
LightWire.registerDocument(TestDocument3);

export class TestDocumentEmbedded extends Document {
  constructor() {
    super(TestDocumentEmbedded);
    this.height = 0.0;
    this.weight = 0.0;
  }

  get schema() { return { height: Types.Float, weight: Types.Float }; }
}
LightWire.registerDocument(TestDocumentEmbedded);

export class TestDocumentEmbeddedVariable extends Document {
  constructor(height, weight, data) {
    super(TestDocumentEmbeddedVariable);
    this.height = height || 0.0;
    this.weight = weight || 0.0;
    this.data = data || null;
  }

  get schema() { return { height: Types.Float, weight: Types.Float, data: Types.Object }; }
}
LightWire.registerDocument(TestDocumentEmbeddedVariable);

export class TestDocumentEmbed extends Document {
  constructor() {
    super(TestDocumentEmbed);
    this.a = 0;
    this.embedded = null;
  }

  get schema() { return { a: Types.UInt, embedded: TestDocumentEmbedded }; }
}
LightWire.registerDocument(TestDocumentEmbed);

export class TestDocumentEmbedVariable extends Document {
  constructor() {
    super(TestDocumentEmbedVariable);
    this.a = 0;
    this.embedded = null;
    this.b = null;
  }

  get schema() { return { a: Types.Short, embedded: [Types.LightWire], b: [Types.Float] }; }
  // module.exports.TestDocumentEmbeddedVariable
}
LightWire.registerDocument(TestDocumentEmbedVariable);

export class TestDocumentEmbedPlusArrayString extends Document {
  constructor(a, embedded) {
    super(TestDocumentEmbedPlusArrayString);
    this.a = a || null;
    this.embedded = embedded || null;
  }

  get schema() { return { a: [Types.String], embedded: [Types.LightWire] }; }
}
LightWire.registerDocument(TestDocumentEmbedPlusArrayString);

export class TestCacheString extends Document {
  constructor(embedded, cache) {
    super(TestCacheString);
    this.embedded = embedded || null;
    this.cache = cache;
  }

  get schema() { return { cache: Types.CacheString, embedded: TestDocumentEmbedPlusArrayString }; }
}
LightWire.registerDocument(TestCacheString);

// for (let msg in module.exports){
// console.log("Register", msg);
// LightWire.registerDocument(module.exports[msg]);
// }

// export default TestDocuments;

// console.log("DOCUMENTS:");
// console.log(LightWire._documents);
// console.log("\nSCHEMAS:");
// console.log(LightWire._schemas);
