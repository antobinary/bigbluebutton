import { check } from 'meteor/check';
import PresentationPods from '/imports/api/presentation-pods';
import { Slides } from '/imports/api/slides';
import Logger from '/imports/startup/server/logger';

export default function setCurrentPresentation(meetingId, podId, currentPresentationId) {
  check(meetingId, String);
  check(currentPresentationId, String);
  check(podId, String);

  // when switching to a different presentation we don't know which slide to display
  const firstSlide = Slides.findOne({ 
    meetingId,
    presentationId: currentPresentationId,
     num: 1}); // TODO -- this is not ideal; It means that when switching from presentation A, slide 3
     // to presentation B, and back to presentation A, we re-start from slide 1

  const selector = {
    meetingId,
    podId,
  };

  const modifier = {
    $set: {
      currentPresentationId,
      currentSlideId: firstSlide?.id,
    },
  };

  try {
    const numberAffected = PresentationPods.update(selector, modifier);
    
    if (numberAffected) {
      Logger.info('PresentationPods::set currentPresentationId:', {currentPresentationId})
    }
  } catch (err) {
    Logger.error(`Setting presentation to current: ${err}`);
  }

}
 