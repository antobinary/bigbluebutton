import { type APIRequestContext, expect, type Page as PlaywrightPage, test, type TestInfo } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { type ChecksumAlgorithm, getApiCallUrl, getChecksum, requestApiCall } from '../core/helpers';
import { parameters } from '../core/parameters';
import { MultiUsers } from '../user/multiusers';

// The algorithm GetChecksumValidator picks from the length of a checksum.
const ALGORITHM_BY_LENGTH: Record<number, ChecksumAlgorithm> = {
  40: 'sha1',
  64: 'sha256',
  96: 'sha384',
  128: 'sha512',
};

// userdata names outside [A-Za-z0-9_.]: separators, and a trailing '-' that join
// would read as the key without it.
const MALFORMED_USERDATA = ['userdata-x&role=MODERATOR', 'userdata-x=y', 'userdata-bbb_presenter_tools-'];
const ACCEPTED_USERDATA = 'userdata-bbb_show_session_details_on_join';
// In the default getJoinUrlUserdataBlocklist, which applies to viewers.
const BLOCKLISTED_USERDATA = 'userdata-bbb_presenter_tools';
const SIGNED_PARAMETERS = ['fullName', 'meetingID', 'role', 'redirect', 'existingUserID', 'checksum'];

const isMeetingRunning = async (request: APIRequestContext, meetingID: string) =>
  (await requestApiCall(request, getApiCallUrl('isMeetingRunning', { meetingID }))).response.running?.[0];

export class APIGetJoinUrl extends MultiUsers {
  // getJoinUrl (ApiController.getJoinUrl) signs a join URL for the caller's own
  // session: its name, meeting, role and user ID, plus the userdata keys with a
  // well-formed name that the blocklist allows (moderators skip the blocklist).
  // Any other request parameter is left out. The session comes from the request
  // context's cookie, as the client's call would carry it.
  async testSignedParameterSet(page: PlaywrightPage, testInfo: TestInfo, request: APIRequestContext) {
    // getJoinUrl answers for a running meeting only.
    await this.initModPage(page, { testInfo });
    const { meetingId } = this.modPage;
    await expect.poll(() => isMeetingRunning(request, meetingId), { timeout: ELEMENT_WAIT_LONGER_TIME }).toBe('true');

    const cases = [
      { role: 'VIEWER', strayRole: 'MODERATOR', fullName: 'SignedViewer', userdata: [ACCEPTED_USERDATA] },
      {
        role: 'MODERATOR',
        strayRole: 'VIEWER',
        fullName: 'SignedModerator',
        userdata: [ACCEPTED_USERDATA, BLOCKLISTED_USERDATA],
      },
    ];
    for (const { role, strayRole, fullName, userdata } of cases) {
      await test.step(role, async () => {
        const { response: joined } = await requestApiCall(
          request,
          getApiCallUrl('join', { fullName, meetingID: meetingId, role, redirect: 'false' }),
        );
        expect(joined.returncode, `the ${role} join should succeed`).toEqual(['SUCCESS']);
        const sessionToken = joined.session_token?.[0] as string;

        // Built by hand so every name reaches bbb-web as written here.
        const query = [
          `sessionToken=${sessionToken}`,
          `role=${strayRole}`,
          ...MALFORMED_USERDATA.map((name) => `${encodeURIComponent(name)}=1`),
          `${ACCEPTED_USERDATA}=false`,
          `${BLOCKLISTED_USERDATA}=pencil`,
        ].join('&');
        const res = await request.get(`${parameters.server}/api/getJoinUrl?${query}`, {
          headers: { Accept: 'application/json' },
        });
        const { response } = await res.json();
        expect(response.returncode, `getJoinUrl for the ${role} should succeed`).toBe('SUCCESS');
        const { url }: { url: string } = response;

        const rawQuery = url.slice(url.indexOf('?') + 1);
        const signed = new URLSearchParams(rawQuery);
        expect([...signed.keys()].sort(), `the ${role} URL should carry exactly the expected parameters`).toEqual(
          [...SIGNED_PARAMETERS, ...userdata].sort(),
        );
        expect(Object.fromEntries(signed), `the ${role} URL should describe the session`).toMatchObject({
          fullName,
          meetingID: meetingId,
          role,
          redirect: 'true',
          existingUserID: joined.user_id?.[0],
        });

        const checksum = signed.get('checksum') ?? '';
        const algorithm = ALGORITHM_BY_LENGTH[checksum.length];
        expect(algorithm, `the ${role} URL checksum should have a supported length`).toBeDefined();
        const signedQuery = rawQuery.replace(`&checksum=${checksum}`, '');
        expect(checksum, `the ${role} URL checksum should cover its query string`).toBe(
          getChecksum(`join${signedQuery}${parameters.secret}`, parameters.secret!, algorithm),
        );

        const followed = await requestApiCall(request, url);
        expect(followed.status, `join should accept the ${role} URL`).toBe(302);
        expect(followed.redirectErrors, `join should accept the ${role} URL`).toBeUndefined();
        expect(followed.location, `the ${role} URL should open a session`).toMatch(/sessionToken=[a-z0-9]+/);
      });
    }
  }
}
