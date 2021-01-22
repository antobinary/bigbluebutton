import RedisPubSub from '/imports/startup/server/redis';
import { check } from 'meteor/check';
import Polls from '/imports/api/polls';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function publishVote(pollId, pollAnswerId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'RespondToPollReqMsg';
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  check(pollAnswerId, Number);
  check(pollId, String);

  const currentSelector = doc => doc.meetingId === meetingId && doc.users.includes(requesterUserId) && doc.id === id; // && doc.answers.some((answer) => answer.id===pollAnswerId)

  const allowedToVote = Polls.findOne(currentSelector, {
    fields: {
      users: 1,
    },
  });

  if (!allowedToVote) {
    Logger.info(`Poll User={${requesterUserId}} has already voted in PollId={${pollId}}`);
    return null;
  }

  const selector = doc => doc.meetingId === meetingId && doc.users.includes(requesterUserId); // && doc.answers.some((answer) => answer.id===pollAnswerId)

  const payload = {
    requesterId: requesterUserId,
    pollId,
    questionId: 0,
    answerId: pollAnswerId,
  };

  /*
   We keep an array of people who were in the meeting at the time the poll
   was started. The poll is published to them only.
   Once they vote - their ID is removed and they cannot see the poll anymore
  */
  const modifier = doc => ({ users: doc.users.filter(user => user !== requesterUserId) });

  try {
    const numberAffected = Polls.update(selector, modifier);

    if (numberAffected) {
      Logger.info(`Removed responded user=${requesterUserId} from poll (meetingId: ${meetingId}, pollId: ${pollId}!)`);

      RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
    }
  } catch (err) {
    Logger.error(`Removing responded user from Polls collection: ${err}`);
  }
}
