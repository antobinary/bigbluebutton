import { Meteor } from 'meteor/meteor';
import Logger from './logger';

Meteor.onConnection((cb) => {
  console.error();
});


// Meteor.onConnection((connection) => {
//   const connectionId = connection.id;
//   console.error(`_1______________`);
//   // console.error()
//   console.error('_2______________')
//   console.error(connection)
//   console.error('_3______________', connectionId)
//   connection.onClose(() => {
//     console.log(`onClose ******************8`);
//   });
// });


class ClientConnections {
  // static getConnection(connectionId) {
  //   return Meteor.server.sessions.get(connectionId);
  // }

  constructor() {
    this.sessionIdToConnectionsMap = new Map();
    const getOurs = () => {
      let counter = 0;
      const connections = [];
      this.sessionIdToConnectionsMap.forEach((v, k, map) => {
        counter += v.length;
        connections.push(v.map(c => c.id));
      });
      return `${counter}--${connections.toString()}`;
    };
    const getAuto = () => {
      const connections = [];
      Meteor.server.sessions.forEach((v, k, map) => connections.push(v.id));
      return `${Meteor.server.sessions.size}--${connections.toString()}`;
    };
    setInterval(() => {
      console.error(`___________\n_____auto:${getAuto()} \n_____ours:${getOurs()}`);
    }, 2500);
    Logger.info('Created sessionIdToConnectionsMap=', this.sessionIdToConnectionsMap);
  }

  printConnectionIds() {
    this.sessionIdToConnectionsMap.forEach((k, v) => {
      // console.error(k)
      const ids = k.map(connection => connection.id);
      console.log(`sessionId: ${v}, has ${k.length} connections:${ids}`);
    });
  }

  addConnection(sessionId, conn) {
    const connection = conn;
    // console.info(`~~~ trying to add ${sessionId}=>${connection.id} while ${this.printConnectionIds()}`);
    // console.info('~~~ ', conn);

    const existingConnectionsArray = this.sessionIdToConnectionsMap.get(sessionId) || [];

    if (existingConnectionsArray && existingConnectionsArray.length && existingConnectionsArray.filter(c => c.id === connection.id).length) {
      console.error(`++++++++++++ addConnection for ${sessionId}     ${connection.id}      alreadyExisted`);
      return false; // did not need to add
    }
    existingConnectionsArray.push(connection);
    this.sessionIdToConnectionsMap.set(sessionId, existingConnectionsArray);
    // console.error(connection.onClose.toString())

    // function (fn) {
    //         var cb = Meteor.bindEnvironment(fn, "connection onClose callback");
    //
    //           if (self.inQueue) {
    //             self._closeCallbacks.push(cb);
    //           } else {
    //             // if we're already closed, call the callback.
    //              Meteor.defer(cb);
    //          }
    //      }

    // console.error('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
    // console.error(conn);
    // console.error(conn.id);
    // console.error(conn.onClose.toString());
    // console.error('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');


    console.error(`++++++++++++ addConnection for ${sessionId}     ${connection.id}      new`);
    return true; // truly added
    // // this.sessionIdToConnectionsMap.set(sessionId, existingConnectionsArray);
    // this.sessionIdToConnectionsMap.set(sessionId, [...new Set(existingConnectionsArray)]); // TODO --
    // //  do I still need this needed it when I was saving connectionIds to make them unique
  }

  removeConnection(sessionId, connectionId) {
    const connectionsBeforeRemoval = this.getConnectionsForSessionId(sessionId);
    // console.info({connectionsBeforeRemoval});
    console.error(`------------ removeConnection for ${sessionId}     ${connectionId}  had connection: ${connectionsBeforeRemoval.length}`);

    if (connectionsBeforeRemoval.length === 0) {
      // console.warn(`Trying to remove connection ${sessionId} => ${connectionId} but it was not found`);
    } else {
      // connectionsBeforeRemoval.
      // connectionsBeforeRemoval.map((c) => { console.log(`~~ ${c.id}   ** ${connectionId}`); console.log({ c }); });
      const result = connectionsBeforeRemoval.filter(connection => connection.id !== connectionId);
      // console.error({result})
      if (result && result.length > 0) {
        console.log(`reducing connections for ${sessionId}`);
        return this.sessionIdToConnectionsMap.set(sessionId, result);
      }
      console.log(`clearing connections for ${sessionId}`);
      return this.sessionIdToConnectionsMap.delete(sessionId);
    }
  }

  // getConnectionIds {}
  getConnectionsForSessionId(sessionId) {
    return this.sessionIdToConnectionsMap.get(sessionId) || [];
    // const connections = this.sessionIdToConnectionsMap.get(sessionId) || [];
    // // connections.forEach((id) => { console.error(id); })
    // console.info(`end of getConnectionStatus for ${sessionId}`);
    // // TODO we may have more than 1 connection!!!
    // console.info(`connectionIds.length:`, connections.length)
    // console.info(`connectioIds[0]:`, connections[0])
    // console.info(`connectioIds[0]:`, connections[0])
    // return connections.length ? ClientConnections.getConnection(connections[0]) : '';
  }

  getActiveConnectionsFor(sessionId) {
    // TODO currently hardcoded to return the first connection.
    // We may have more than one if the user uses the same url in different browser tab
    const connections = this.getConnectionsForSessionId(sessionId);
    return (connections && connections[0]) ? connections[0] : null;
  }

  hasActiveConnection(sessionId) {
    return this.getConnectionsForSessionId(sessionId).length > 0;
  }
}


const ClientConnectionsSingleton = new ClientConnections();

export default ClientConnectionsSingleton;


/*
  // TODO
  * how do we handle Flash users
  * how do we handle Guest users

  * remove inactivity check
  * remove responseDelay
  * tweak effectiveConnectionType??
  * remove connectionStatus
  * remove offline users from collection and adjust chat collection accordingly
  * remove connectionId from the user object
  *
  * how do I handle dial-in users (they do not validate?)
  * need to add loginTime: Date.now(), and  inactivityCheck: false, on addUser.js
  * need to re-add stopWatchingExternalVideo({ meetingId, requesterUserId: userId }); which we previously had in modifiers/removeUser.js

 */


/*

Secure connections
  1. Add in-memory data source to manage active connections
     1.1 Might make sense to have it as a HashMap(connectionId, connection) and HashMap(`${meetingId}--${userId}`, [connection1, connection2, ...])
     1.2 Attach an onClose handler there
     1.3 A userId could have multiple active connections
     1.4 Searchable by meetingId + userId, or connectionId
  2. In validateAuthToken add userId, meetingId, authToken, and validate status to the this.connection object
  3. Check if this.connection is validated with property on the connection before before publishing
  4. Invalidate and close the connection(s) on logout, meeting end, and kick
  5. New Mongo collection for auth token validation
     5.1 Replacement for current-user
     5.2 (meetingId, userId, connectionId, validationState)
     5.3 states[not_validated, validating, valid, invalid]
       5.3.1 The states would be the same as on the connecton object itself
       5.3.2  The values should be an enum for easier usage
     5.4 It would allow us to always return a record for each publish request rather than sometimes returning nothing
       5.4.1 Would remove need for multiple validate calls clogging the server

 */
