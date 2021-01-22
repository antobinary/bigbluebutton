import { check } from 'meteor/check';
import Captions from '/imports/api/captions';
import updateOwnerId from '/imports/api/captions/server/modifiers/updateOwnerId';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function takeOwnership(locale) {
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  check(locale, String);

  const regex = new RegExp(`_captions_${locale}$`);
  const pad = Captions.findOne(doc => doc.meetingId === meetingId && regex.test(doc.padId));
  if (pad) {
    updateOwnerId(meetingId, requesterUserId, pad.padId);
  }
}
