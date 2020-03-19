import { Meteor } from 'meteor/meteor';
import Logger from './logger';

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

  addConnection(sessionId, connection) {
    console.info(`~~~ trying to add ${sessionId}=>${connection.id} while ${this.printConnectionIds()}`);

    const existingConnectionsArray = this.sessionIdToConnectionsMap.get(sessionId) || [];

    if (existingConnectionsArray && existingConnectionsArray.length && existingConnectionsArray.filter(c => c.id === connection.id).length) {
      console.error(`++++++++++++ addConnection for ${sessionId}     ${connection.id}      alreadyExisted`);
      return false; // did not need to add
    }
    existingConnectionsArray.push(connection);
    this.sessionIdToConnectionsMap.set(sessionId, existingConnectionsArray);
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
      connectionsBeforeRemoval.map((c) => { console.log(`~~ ${c.id}   ** ${connectionId}`); console.log({ c }); });
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

  hasActiveConnection(sessionId) {
    return this.getConnectionsForSessionId(sessionId).length > 0;
  }
}


const ClientConnectionsSingleton = new ClientConnections();

export default ClientConnectionsSingleton;
