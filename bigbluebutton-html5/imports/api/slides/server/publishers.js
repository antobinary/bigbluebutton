import { Slides, SlidePositions } from '/imports/api/slides';
import { LWMeteor } from '/imports/startup/lightwire';
import Logger from '/imports/startup/server/logger';
import AuthTokenValidation, { ValidationStates } from '/imports/api/auth-token-validation';

function slides() {
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing Slides was requested by unauth connection ${this.connection.id}`);
    return Slides.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;

  Logger.debug('Publishing Slides', { meetingId, userId });

  return Slides.find({ meetingId });
}

function publish(...args) {
  const boundSlides = slides.bind(this);
  return boundSlides(...args);
}

LWMeteor.publish('slides', publish);

function slidePositions() {
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing SlidePositions was requested by unauth connection ${this.connection.id}`);
    return SlidePositions.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;

  Logger.debug('Publishing SlidePositions', { meetingId, userId });

  return SlidePositions.find({ meetingId });
}

function publishPositions(...args) {
  const boundSlidePositions = slidePositions.bind(this);
  return boundSlidePositions(...args);
}

LWMeteor.publish('slide-positions', publishPositions);
