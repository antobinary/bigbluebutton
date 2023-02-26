import { check } from 'meteor/check';
import PresentationPods from '/imports/api/presentation-pods';
import Logger from '/imports/startup/server/logger';

export default function changeCurrentSlide(meetingId, podId, presentationId, slideId) {
  check(meetingId, String);
  check(presentationId, String);
  check(slideId, String);
  check(podId, String);

  const selector = {
    meetingId,
    podId,
  };

  const modifier = {
    $set: {
      currentSlideId: slideId,
    },
  };

  try {
    const { numberAffected } = PresentationPods.upsert(selector, modifier);

    if (numberAffected) {
      Logger.info(`Set a new current slide in pod id=${podId} meeting=${meetingId} slideId=${slideId}`);
    }
  } catch (err) {
    Logger.error(`Error on setting a new current slide in pod: ${err}`);
  }

}
