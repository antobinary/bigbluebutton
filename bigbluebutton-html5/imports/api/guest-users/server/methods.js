import { LWMeteor } from '/imports/startup/lightwire';
import allowPendingUsers from '/imports/api/guest-users/server/methods/allowPendingUsers';
import changeGuestPolicy from '/imports/api/guest-users/server/methods/changeGuestPolicy';

LWMeteor.methods({
  allowPendingUsers,
  changeGuestPolicy,
});
