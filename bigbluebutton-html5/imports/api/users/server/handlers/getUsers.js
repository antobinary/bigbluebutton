import { check } from 'meteor/check';
import Users from '/imports/api/users/';
import addUser from '../modifiers/addUser';
import removeUser from '../modifiers/removeUser';

export default function handleGetUsers({ body }, meetingId) {
  const { users } = body;

  check(meetingId, String);
  check(users, Array);

  const usersIds = users.map(m => m.intId);

  const selector = doc => doc.meetingId === meetingId && !usersIds.includes(doc.userId);

  const usersToRemove = Users.find(selector, { fields: { userId: 1 } }).fetch();
  usersToRemove.forEach(user => removeUser(meetingId, user.userId));

  const usersAdded = [];
  users.forEach((user) => {
    usersAdded.push(addUser(meetingId, user));
  });

  return usersAdded;
}
