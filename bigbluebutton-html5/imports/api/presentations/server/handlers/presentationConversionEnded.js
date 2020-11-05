import { check } from 'meteor/check';
import Presentations from '/imports/api/presentations';
import Logger from '/imports/startup/server/logger';

export default function handlePresentationConversionEnded({ body }, meetingId) {
  check(body, Object);

  const { presentationId, podId, presName } = body;

  const selector = {
    meetingId,
    podId,
    id: presentationId,
  };


  const p = Presentations.findOne(selector);

  const modifier = {
    $set: Object.assign({
      meetingId,
      podId,
      id: presentationId,
      filename: presName,
      name: presName,
      pages: p.pages,
      upload: { done: true, error: false, progress: 100 },
      'conversion.done': true,
      'conversion.error': false,
    }),
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Update presentation conversion end: ${err}`);
    }

    return Logger.info(`Update presentation conversion end id=${presentationId} meeting=${meetingId}`);
  };

  return Presentations.upsert(selector, modifier, cb);
}
