import PresentationPods from '/imports/api/presentation-pods';
import { Slides } from '/imports/api/slides';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';

export default function switchSlide(slideNumber, podId) { // TODO-- send presentationId and SlideId
// export default function switchSlide(slideNumber, podId, presentationIdpresentationId) { // TODO-- send presentationId and SlideId
  console.error('switchslide ', {slideNumber})
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'SetCurrentPagePubMsg';

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);
    check(slideNumber, Number);
    check(podId, String);

    const selector = {
      meetingId,
      podId,
    };

    const PresentationPod = PresentationPods.findOne(selector);

    if (!PresentationPod) {
    // if (!PresentationPod || PresentationPod.currentPresentationId !== presentationId) {
      throw new Meteor.Error('pod-not-found', `podId ${podId} not found in the current meeting`);
    }

    const Slide = Slides.findOne({
      meetingId,
      podId,
      num: slideNumber,
    });

    if (!Slide) {
      throw new Meteor.Error('slide-not-found', `Slide number ${slideNumber} not found in the current presentation`);
    }

    const payload = {
      podId,
      presentationId: PresentationPod.currentPresentationId,
      pageId: Slide.id,
    };

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method switchSlide ${err.stack}`);
  }
}
