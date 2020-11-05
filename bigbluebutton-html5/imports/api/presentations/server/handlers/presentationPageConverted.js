import { check } from 'meteor/check';
import addPresentationPage from '../modifiers/addPresentationPage';

export default function handlePresentationPageConverted({ body }, meetingId) {
  check(meetingId, String);
  return addPresentationPage(meetingId, body);
}
