import Auth from '/imports/ui/services/auth';
import Presentations from '/imports/api/presentations';
import { makeCall } from '/imports/ui/services/api';
import { throttle } from 'lodash';

const PAN_ZOOM_INTERVAL = Meteor.settings.public.presentation.panZoomInterval || 200;

const getNumberOfSlides = (podId, presentationId) => {
  const meetingId = Auth.meetingID;

  const presentation = Presentations.findOne({
    meetingId,
    podId,
    id: presentationId,
  });

  return presentation && presentation.pages ? presentation.pages.length : 0;
};

const previousSlide = (currentSlideNum, podId) => {
  console.error('prev slide, ', {currentSlideNum})
  if (currentSlideNum > 1) {
    makeCall('switchSlide', currentSlideNum - 1, podId);
  }
};

const nextSlide = (currentSlideNum, numberOfSlides, podId) => {
  console.error('next slide ', {currentSlideNum, numberOfSlides});
  if (currentSlideNum < numberOfSlides) {
    makeCall('switchSlide', currentSlideNum + 1, podId); // TODO deciding on whether num or id should be passed
  }
};

const zoomSlide = throttle((currentSlideNum, podId, widthRatio, heightRatio, xOffset, yOffset) => {
  makeCall('zoomSlide', currentSlideNum, podId, widthRatio, heightRatio, xOffset, yOffset);
}, PAN_ZOOM_INTERVAL);

const skipToSlide = (requestedSlideNum, podId) => {
  makeCall('switchSlide', requestedSlideNum, podId);
};

export default {
  getNumberOfSlides,
  nextSlide,
  previousSlide,
  skipToSlide,
  zoomSlide,
};
