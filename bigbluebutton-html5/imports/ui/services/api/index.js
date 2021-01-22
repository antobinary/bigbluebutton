import Auth from '/imports/ui/services/auth';
import { check } from 'meteor/check';
import logger from '/imports/startup/client/logger';
import { LWMeteor } from '/imports/startup/lightwire';

/**
 * Send the request to the server via Meteor.call and don't treat errors.
 *
 * @param {string} name
 * @param {any} args
 * @see https://docs.meteor.com/api/methods.html#Meteor-call
 * @return {Promise}
 */
export function makeCall(name, ...args) {
  check(name, String);

  // const { credentials } = Auth;

  return new Promise((resolve, reject) => {
    if (LWMeteor.status().connected) {
      LWMeteor.call(name, ...args, (error, result) => {
        if (error) {
          reject(error);
        }

        resolve(result);
      });
    } else {
      const failureString = `Call to ${name} failed because Meteor is not connected`;
      // We don't want to send a log message if the call that failed was a log message.
      // Without this you can get into an endless loop of failed logging.
      if (name !== 'logClient') {
        logger.warn({
          logCode: 'servicesapiindex_makeCall',
          extraInfo: {
            attemptForUserInfo: Auth.fullInfo,
            name,
            ...args,
          },
        }, failureString);
      }
      reject(failureString);
    }
  });
}



export function makeCallLW(name, ...args) {
  check(name, String);

  return new Promise((resolve, reject) => {
    if (LWMeteor.status().connected) {
      LWMeteor.call(name, ...args, (error, result) => {
        if (error) {
          reject(error);
        }

        resolve(result);
      });
    } else {
      const failureString = `Call to ${name} failed because Meteor is not connected`;
      // We don't want to send a log message if the call that failed was a log message.
      // Without this you can get into an endless loop of failed logging.
      if (name !== 'logClient') {
        logger.warn({
          logCode: 'servicesapiindex_makeCall',
          extraInfo: {
            attemptForUserInfo: Auth.fullInfo,
            name,
            ...args,
          },
        }, failureString);
      }
      reject(failureString);
    }
  });
}
