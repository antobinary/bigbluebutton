import { Document, Types } from '/imports/api/lightwire/lightwire';
import { MethodDocument } from '/imports/api/lightwire/meteor-documents';

export class AuthTokenValidationCollection extends Document {
  constructor() {
    super();
    this._collection = 'auth-token-validation';
    this._id = 0;

    this.meetingId = 'asdf';
    this.userId = 'asdf';
    this.connectionId = '1000000';
    this.validationStatus = 'ALLOW';
    this.updatedAt = 0;
  }

  get schema() {
    return {
      _id: Types.UInt,
      meetingId: Types.CacheString,
      userId: Types.CacheString,
      connectionId: Types.String,
      validationStatus: Types.CacheString,
      updatedAt: Types.Date,
    };
  }
}
