import { Meteor } from 'meteor/meteor';

let LightWire,  LWMeteor;

if (Meteor.isServer){
  ({ LightWire, LWMeteor } = require('./server/lightwire-server.js'));
}
else{
  ({ LightWire, LWMeteor } = require('./client/lightwire-client.js'));
}
export { LightWire, LWMeteor };
