import { Meteor } from 'meteor/meteor';

const AuthTokenValidation = new Mongo.Collection('authtokenvalidation');

if (Meteor.isServer) {
  // types of queries for the meetings:
  // 1. meetingId

  AuthTokenValidation._ensureIndex({ connectionId: 1 });
}

export const ValidationStates = Object.freeze({
  NOT_VALIDATED: 1, VALIDATING: 2, VALIDATED: 3, INVALID: 4,
});

export default AuthTokenValidation;
