# CHANGELOG

All notable changes (from 3.0.11 onwards) will be documented in this file.

For previous changes, see the [release notes](https://github.com/bigbluebutton/bigbluebutton/releases).


## v3.0.14

This iteration contains performance improvements and various client and server side fixes.

Below is a list of the pull requests in this iteration, grouped by component.

Link to installation command / instructions/ schedule / planned features : https://docs.bigbluebutton.org/3.0/new-features

Big THANK YOU to all community members who helped for this release - both through sending pull requests and through reporting bugs or requesting enhancements! :confetti_ball:

### HTML5 client

fixes
* fix: adjust locale dropdown to not display fallback id + include ru-RU en string by @ramonlsouza in https://github.com/bigbluebutton/bigbluebutton/pull/23708
* fix: Fullscreen by ENTER not working inside of the presentation by @ramonlsouza in https://github.com/bigbluebutton/bigbluebutton/pull/23715
* [3.0]  Extract multiple quick polls WITH text options by @hiroshisuga in https://github.com/bigbluebutton/bigbluebutton/pull/23722
* fix: quick external video share not working at fullscreen by @ramonlsouza in https://github.com/bigbluebutton/bigbluebutton/pull/23730
* [3.0 Quick poll] number of options up to 19 by @hiroshisuga in https://github.com/bigbluebutton/bigbluebutton/pull/23698
* Feat(html5): Add hot reload environment variable by @Tainan404 in https://github.com/bigbluebutton/bigbluebutton/pull/23729
* Fix(html5): Video preview modal keeps frozen when using bbb_auto_share_webcam and bbb_skip_video_preview by @Tainan404 in https://github.com/bigbluebutton/bigbluebutton/pull/23740
* feat: Tweak floating window to enhance usability and stability by @GuiLeme in https://github.com/bigbluebutton/bigbluebutton/pull/23717
* fix(html5/whiteboard): Do not run resync code on change page by @JoVictorNunes in https://github.com/bigbluebutton/bigbluebutton/pull/23750
* ref: Added information to useUsersBasicInfo and ordered the results by @GuiLeme in https://github.com/bigbluebutton/bigbluebutton/pull/23688
* fix(html5/whiteboard): Debounced function recreated on every render by @JoVictorNunes in https://github.com/bigbluebutton/bigbluebutton/pull/23772
* Refactor (html5): Remove Subscriptions and Add Conditional Execution for Performance Optimization by @Tainan404 in https://github.com/bigbluebutton/bigbluebutton/pull/23758
* feat(html5/bbb-web): layout engine wait for enforcedLayout finish loading  by @GuiLeme in https://github.com/bigbluebutton/bigbluebutton/pull/23755
* fix(html5): remove leading blank spaces from correct answer lines by @KDSBrowne in https://github.com/bigbluebutton/bigbluebutton/pull/23765
* Ref(html5): Make useMeeting use MeetingStaticData by @Tainan404 in https://github.com/bigbluebutton/bigbluebutton/pull/23767
* fix: skip invalid quick polls by @ramonlsouza in https://github.com/bigbluebutton/bigbluebutton/pull/23804
* Ref(html5): Reduce user_current usage through the client. by @Tainan404 in https://github.com/bigbluebutton/bigbluebutton/pull/23788
* refactor(html5): Optimize audio functions and reduce prop drilling using MeetingStaticData by @Tainan404 in https://github.com/bigbluebutton/bigbluebutton/pull/23809
* Subscription kills by @Tainan404 in https://github.com/bigbluebutton/bigbluebutton/pull/23777
* feat(html5): add structured logs for NotificationsBar connection errors by @Tainan404 in https://github.com/bigbluebutton/bigbluebutton/pull/23795
* feat(html5): Add global error listeners for runtime, resource, and unhandled errors by @Tainan404 in https://github.com/bigbluebutton/bigbluebutton/pull/23801
* Fix(html5): Tooltip not applying translation by @Tainan404 in https://github.com/bigbluebutton/bigbluebutton/pull/23821
* [3.0] fix: inconsistent hook component remounting due to count-based keys by @Arthurk12 in https://github.com/bigbluebutton/bigbluebutton/pull/23816
* fix: wrong zoom position on slide change by @ramonlsouza in https://github.com/bigbluebutton/bigbluebutton/pull/23828
* fix: Resolve missing or duplicated key problem in data-channel or custom-subscriptions by @GuiLeme in https://github.com/bigbluebutton/bigbluebutton/pull/23775

test
* test: Update smart slides test by @gabriellpr in https://github.com/bigbluebutton/bigbluebutton/pull/23700
* Add tests for "End meeting" Functionality by @pinhaum in https://github.com/bigbluebutton/bigbluebutton/pull/23642
* fix (ci / aut-tests): "Too Many Requests" issue when downloading Libreoffice docker image by @gustavotrott in https://github.com/bigbluebutton/bigbluebutton/pull/23773
* Add Focus/Unfocus Webcam Automated Tests by @pinhaum in https://github.com/bigbluebutton/bigbluebutton/pull/23705
* test: add test to verify stopping screenshare functionality by @pinhaum in https://github.com/bigbluebutton/bigbluebutton/pull/23522
* ci (aut-tests): Use cache to download BBB dependencies from apt by @gustavotrott in https://github.com/bigbluebutton/bigbluebutton/pull/23789
* test: [Snyk] Security upgrade sha.js from 2.4.11 to 2.4.12 by @antobinary in https://github.com/bigbluebutton/bigbluebutton/pull/23791
* ci (aut-tests): Add cache for Playright binaries by @gustavotrott in https://github.com/bigbluebutton/bigbluebutton/pull/23796
* Add test for "mirror webcam" by @pinhaum in https://github.com/bigbluebutton/bigbluebutton/pull/23760
* ci (aut-tests): Improve apt cache and other workflow enhancements by @gustavotrott in https://github.com/bigbluebutton/bigbluebutton/pull/23803
* Add tests for "Leave meeting" Functionality  by @pinhaum in https://github.com/bigbluebutton/bigbluebutton/pull/23811

plugin related
* ref(plugin): rename changeEnforcedLayout to setEnforcedLayout by @GuiLeme in https://github.com/bigbluebutton/bigbluebutton/pull/23663
* feat(html5): add new PLUGINS_ONLY layout type by @GuiLeme in https://github.com/bigbluebutton/bigbluebutton/pull/23696

chore
* Chore(html5): update libs by @Tainan404 in https://github.com/bigbluebutton/bigbluebutton/pull/23723
* chore(client): enable quizzing by default by @ramonlsouza in https://github.com/bigbluebutton/bigbluebutton/pull/23826
* chore: npm dependencies bump by @antobinary in https://github.com/bigbluebutton/bigbluebutton/pull/23831
* chore: Improvements for developments scripts (`run-dev.sh` or `deploy.sh`) by @gustavotrott in https://github.com/bigbluebutton/bigbluebutton/pull/23735
* chore: Ignore Metals cache directory in Git by @gustavotrott in https://github.com/bigbluebutton/bigbluebutton/pull/23774


locales
* Updates for project BigBlueButton v3.0 HTML5 client and language nb_NO by @transifex-integration[bot] in https://github.com/bigbluebutton/bigbluebutton/pull/23734
* Updates for project BigBlueButton v3.0 HTML5 client and language ja by @transifex-integration[bot] in https://github.com/bigbluebutton/bigbluebutton/pull/23727
* Updates for project BigBlueButton v3.0 HTML5 client and language it_IT by @transifex-integration[bot] in https://github.com/bigbluebutton/bigbluebutton/pull/23741
* Updates for project BigBlueButton v3.0 HTML5 client and language el_GR by @transifex-integration[bot] in https://github.com/bigbluebutton/bigbluebutton/pull/23752
* Updates for project BigBlueButton v3.0 HTML5 client and language ja by @transifex-integration[bot] in https://github.com/bigbluebutton/bigbluebutton/pull/23751
* Updates for project BigBlueButton v3.0 HTML5 client and language eu by @transifex-integration[bot] in https://github.com/bigbluebutton/bigbluebutton/pull/23746
* Updates for project BigBlueButton v3.0 HTML5 client and language fr by @transifex-integration[bot] in https://github.com/bigbluebutton/bigbluebutton/pull/23782
* Updates for project BigBlueButton v3.0 HTML5 client and language et by @transifex-integration[bot] in https://github.com/bigbluebutton/bigbluebutton/pull/23745

### Core
* feat (gql-server): Add new graphql flag `componentFlags.hasSharedNotes` by @gustavotrott in https://github.com/bigbluebutton/bigbluebutton/pull/23738
* perf (gql-server): Optimize Meeting data fetching with new `meetingStaticData` endpoint and Nginx caching by @gustavotrott in https://github.com/bigbluebutton/bigbluebutton/pull/23749
* perf (gql-server): Add more permissions for Hasura role `bbb_client_not_in_meeting` by @gustavotrott in https://github.com/bigbluebutton/bigbluebutton/pull/23778
* perf (gql-server): Add more permissions for Hasura role `bbb_client_not_in_meeting` (part 2) by @gustavotrott in https://github.com/bigbluebutton/bigbluebutton/pull/23787
* perf (gql-server): Shift cursor streaming from Hasura to bbb-graphql-middleware by @gustavotrott in https://github.com/bigbluebutton/bigbluebutton/pull/23768

### learning analytics dashboard
* fix(bbb-learning-dashboard): Wrong poll answer count by @JoVictorNunes in https://github.com/bigbluebutton/bigbluebutton/pull/23718
* fix(bbb-learning-dashboard): Quizzes table sorting toggling doesn't work by @JoVictorNunes in https://github.com/bigbluebutton/bigbluebutton/pull/23719
* improvement(bbb-learning-dashboard): Avoid function reinstantiations on every render by @JoVictorNunes in https://github.com/bigbluebutton/bigbluebutton/pull/23716

### export-annotations
* fix(bbb-export-annotations): Text wrapping in text shapes by @JoVictorNunes in https://github.com/bigbluebutton/bigbluebutton/pull/23683

### packaging and configuration
* build(bbb-webrtc-sfu): v2.19.0-beta.6 by @prlanzarin in https://github.com/bigbluebutton/bigbluebutton/pull/23761
* build(bbb-webrtc-sfu): v2.19.0 by @prlanzarin in https://github.com/bigbluebutton/bigbluebutton/pull/23802
* build: Bump bbb-pads to 1.5.5 by @antobinary in https://github.com/bigbluebutton/bigbluebutton/pull/23829

### documentation
* docs: Improve `userdata-bbb_initial_selected_tool` description by @JoVictorNunes in https://github.com/bigbluebutton/bigbluebutton/pull/23675
* docs: Add instructions when the proxy server uses a different root domain than the BBB server by @gustavotrott in https://github.com/bigbluebutton/bigbluebutton/pull/23776

**Full Changelog**: https://github.com/bigbluebutton/bigbluebutton/compare/v3.0.13...v3.0.14

### Release name

Passing `-v jammy-300` to https://github.com/bigbluebutton/bbb-install/blob/v3.0.x-release/bbb-install.sh will always install the latest released BigBlueButton 3.0 version.  

If for some reason you would like to install this specific release, pass `-v jammy-300-3.0.14`.  

We still recommend using `-v jammy-300` as this repository is continually updated with each BigBlueButton 3.0 release.


### Client build: 1452



## v3.0.13

This iteration contains various client and server side fixes. Several security fixes are also included. **We encourage administrators to update!**

Below is a list of the pull requests in this iteration, grouped by component.

Link to installation command / instructions/ schedule / planned features : https://docs.bigbluebutton.org/3.0/new-features

Big THANK YOU to all community members who helped for this release - both through sending pull requests and through reporting bugs or requesting enhancements! :confetti_ball:

### HTML5 client

fixes
* Fix(html5): quickPollConfirmationStep turning quiz to poll by @Tainan404 in https://github.com/bigbluebutton/bigbluebutton/pull/23600
* Ref(html5): Quiz style refinements by @Tainan404 in https://github.com/bigbluebutton/bigbluebutton/pull/23589
* dev(client): add react-refresh in dev mode so hot reload can work by @lfzawacki in https://github.com/bigbluebutton/bigbluebutton/pull/23560
* fix(html5): Add regex to handle missing question text in smart slides by @KDSBrowne in https://github.com/bigbluebutton/bigbluebutton/pull/23554
* Chore(html5): add logCodes for initial connection steps by @Tainan404 in https://github.com/bigbluebutton/bigbluebutton/pull/23625
* Fix(html5): Add support to locales on annotation polls by @Tainan404 in https://github.com/bigbluebutton/bigbluebutton/pull/23640
* Fix(html5): prevent poll options from being hidden when the number of options was 10 or greater by @Tainan404 in https://github.com/bigbluebutton/bigbluebutton/pull/23644
* fix(html5): Fix useMeeting hook returning undefined by @GuiLeme in https://github.com/bigbluebutton/bigbluebutton/pull/23379
* Fix: console warnings/errors in the client by @ramonlsouza in https://github.com/bigbluebutton/bigbluebutton/pull/23652
* fix: Device settings window disappears when recording permission prompt appears by @ramonlsouza in https://github.com/bigbluebutton/bigbluebutton/pull/23646
* Fix(html5): Add support to audio elements on external video by @Tainan404 in https://github.com/bigbluebutton/bigbluebutton/pull/23653
* Fix(html5): Correct answer marker clipping on long options by @Tainan404 in https://github.com/bigbluebutton/bigbluebutton/pull/23645
* refactor: remove emoji id from chat reactions by @ramonlsouza in https://github.com/bigbluebutton/bigbluebutton/pull/23651 **contains a security fix. https://github.com/bigbluebutton/bigbluebutton/security/advisories/GHSA-5m8m-h7fj-8wx6 will be made public circa Sept 1, 2025**
* fix(html5/chat): Messages cannot be selected in the chat by @JoVictorNunes in https://github.com/bigbluebutton/bigbluebutton/pull/23654
* fix(html5): Improve smart poll detection for typed-response slides without options by @KDSBrowne in https://github.com/bigbluebutton/bigbluebutton/pull/23639
* chore (html5): Disable error overlay for `react-refresh` feature by @gustavotrott in https://github.com/bigbluebutton/bigbluebutton/pull/23661
* fix(video-preview): correct variable scope to prevent crash on unmount by @Arthurk12 in https://github.com/bigbluebutton/bigbluebutton/pull/23666
* Fix(html5): Console errors on initial client load by @Tainan404 in https://github.com/bigbluebutton/bigbluebutton/pull/23673
* fix: Listen-only participants show misleading crossed-out microphone icon instead of headphones icon by @ramonlsouza in https://github.com/bigbluebutton/bigbluebutton/pull/23672
* fix(livekit): unable to connect if /stuns maxTtl is undefined by @prlanzarin in https://github.com/bigbluebutton/bigbluebutton/pull/23667
* feat(html5): ui-command to better manipulate generic content in sidekick area by @GuiLeme in https://github.com/bigbluebutton/bigbluebutton/pull/23606
* fix: Sequential numbering missing from saved whiteboards and notes in breakout rooms by @ramonlsouza in https://github.com/bigbluebutton/bigbluebutton/pull/23601
* Chore: Add support to typescript on Husky by @Tainan404 in https://github.com/bigbluebutton/bigbluebutton/pull/23599
* Chore: Add logCodes to graphql connection errors and improve connection status messages by @Tainan404 in https://github.com/bigbluebutton/bigbluebutton/pull/23604

test
* test: Add 'Video pagination' test by @gabriellpr in https://github.com/bigbluebutton/bigbluebutton/pull/23396
* Add User Leave Notification Test by @pinhaum in https://github.com/bigbluebutton/bigbluebutton/pull/23586

plugin related
* feat(html5): Added custom-query and custom-mutation for plugins by @GuiLeme in https://github.com/bigbluebutton/bigbluebutton/pull/23489

locales
* Updates for project BigBlueButton v3.0 HTML5 client and language et by @transifex-integration[bot] in https://github.com/bigbluebutton/bigbluebutton/pull/23596
* Updates for project BigBlueButton v3.0 HTML5 client and language ar by @transifex-integration[bot] in https://github.com/bigbluebutton/bigbluebutton/pull/23602
* Updates for project BigBlueButton v3.0 HTML5 client and language it_IT by @transifex-integration[bot] in https://github.com/bigbluebutton/bigbluebutton/pull/23617
* Updates for project BigBlueButton v3.0 HTML5 client and language ar by @transifex-integration[bot] in https://github.com/bigbluebutton/bigbluebutton/pull/23612
* Updates for project BigBlueButton v3.0 HTML5 client and language de by @transifex-integration[bot] in https://github.com/bigbluebutton/bigbluebutton/pull/23624
* Updates for project BigBlueButton v3.0 HTML5 client and language eu by @transifex-integration[bot] in https://github.com/bigbluebutton/bigbluebutton/pull/23621
* Updates for project BigBlueButton v3.0 HTML5 client and language ja by @transifex-integration[bot] in https://github.com/bigbluebutton/bigbluebutton/pull/23638
* Updates for project BigBlueButton v3.0 HTML5 client and language et by @transifex-integration[bot] in https://github.com/bigbluebutton/bigbluebutton/pull/23632
* Updates for project BigBlueButton v3.0 HTML5 client and language zh_TW by @transifex-integration[bot] in https://github.com/bigbluebutton/bigbluebutton/pull/23660
* Updates for project BigBlueButton v3.0 HTML5 client and language uk_UA by @transifex-integration[bot] in https://github.com/bigbluebutton/bigbluebutton/pull/23689

### Core
* fix (bbb-web): Some presentation-related configs not being respected by @gustavotrott in https://github.com/bigbluebutton/bigbluebutton/pull/23605
* fix (gql-actions): Add validation for mutation `pollSubmitUserVote` by @gustavotrott in https://github.com/bigbluebutton/bigbluebutton/pull/23662 **contains a security fix. https://github.com/bigbluebutton/bigbluebutton/security/advisories/GHSA-73j3-v3fq-fqx5 will be made public circa Sept 1, 2025**
* feat(akka/bbb-web): persist plugin errors from back-end to be logged into the front-end  by @GuiLeme in https://github.com/bigbluebutton/bigbluebutton/pull/23540
* fix(bbb-web): Add Presentation Upload Concurrency Explanation by @paultrudel in https://github.com/bigbluebutton/bigbluebutton/pull/23648
* chore: Update bigbluebutton-html-plugin-sdk to version 0.0.90 by @antonbsa in https://github.com/bigbluebutton/bigbluebutton/pull/23686

### learning analytics dashboard
* fix(bbb-learning-dashboard): Poll/Quiz sorting by @JoVictorNunes in https://github.com/bigbluebutton/bigbluebutton/pull/23595
* fix(bbb-learning-dashboard): Localize quiz answers by @JoVictorNunes in https://github.com/bigbluebutton/bigbluebutton/pull/23590
* fix(bbb-learning-dashboard): Quizzes table showing user response as incorrect while the correct answer was not disclosed by @JoVictorNunes in https://github.com/bigbluebutton/bigbluebutton/pull/23609
* chore (Learning Dashboard): Improve run-dev and deploy scripts by @gustavotrott in https://github.com/bigbluebutton/bigbluebutton/pull/23614
* refactor (Learning Dashboard): Add info `ended` for Polls/Quizzes to LAD json by @gustavotrott in https://github.com/bigbluebutton/bigbluebutton/pull/23615
* refactor(learning-analytics-dashboard): Enhance user avatars by @JoVictorNunes in https://github.com/bigbluebutton/bigbluebutton/pull/23628

### recording
* update(recording): add quiz info to presentation format by @germanocaumo in https://github.com/bigbluebutton/bigbluebutton/pull/23608

### export-annotations
* [Snyk] Security upgrade form-data from 4.0.2 to 4.0.4 by @antobinary in https://github.com/bigbluebutton/bigbluebutton/pull/23622
* fix: Poll Results in the pdf-File by @ramonlsouza in https://github.com/bigbluebutton/bigbluebutton/pull/23694

### packaging and configuration
* build: Fix umask issues for systems which run 0077 instead of 0022 by @schrd in https://github.com/bigbluebutton/bigbluebutton/pull/23470
* build: Allow CORS for assets files under /plugins/ and its subdirectories by @gustavotrott in https://github.com/bigbluebutton/bigbluebutton/pull/23655
* build(bbb-webrtc-sfu): v2.19.0-beta.5 by @prlanzarin in https://github.com/bigbluebutton/bigbluebutton/pull/23691
* build(bbb-webrtc-recorder): v0.11.0 by @prlanzarin in https://github.com/bigbluebutton/bigbluebutton/pull/23690
* build: Bump bbb-pads to 1.5.4 by @antobinary in https://github.com/bigbluebutton/bigbluebutton/pull/23693 **contains a security fix. https://github.com/bigbluebutton/bigbluebutton/security/advisories/GHSA-9jv9-cjrm-grj2 will be made public cicra Sept 1, 2025**
* build: Bump bbb-playback to 5.4.0 by @antobinary in https://github.com/bigbluebutton/bigbluebutton/pull/23620

### documentation
* docs: Update cluster proxy documentation by @michelleDeko in https://github.com/bigbluebutton/bigbluebutton/pull/23545
* docs: Replace password with role in API examples by @JoVictorNunes in https://github.com/bigbluebutton/bigbluebutton/pull/23562
* docs: Document meta parameters in create call by @JoVictorNunes in https://github.com/bigbluebutton/bigbluebutton/pull/23565
* docs: Update Admin->Customize instructions to use `/etc/bigbluebutton` override instead of settings files by @JoVictorNunes in https://github.com/bigbluebutton/bigbluebutton/pull/23563
* Docs (plugins): Add example of javascriptEntrypointIntegrity and remove unimplemented features by @gustavotrott in https://github.com/bigbluebutton/bigbluebutton/pull/23692

## New Contributors
* @michelleDeko made their first contribution in https://github.com/bigbluebutton/bigbluebutton/pull/23545

**Full Changelog**: https://github.com/bigbluebutton/bigbluebutton/compare/v3.0.12...v3.0.13



### Release name

Passing `-v jammy-300` to https://github.com/bigbluebutton/bbb-install/blob/v3.0.x-release/bbb-install.sh will always install the latest released BigBlueButton 3.0 version.  

If for some reason you would like to install this specific release, pass `-v jammy-300-3.0.13`.  

We still recommend using `-v jammy-300` as this repository is continually updated with each BigBlueButton 3.0 release.


### Client build: 1424

## v 3.0.12

## What's Changed

This 3.0 iteration contains a fix for a regression reported after BigBlueButton 3.0.11 release.

Below is a list of the pull requests in this iteration, grouped by component.

Link to installation command / instructions/ schedule / planned features : https://docs.bigbluebutton.org/3.0/new-features

Big THANK YOU to all community members who helped for this release - both through sending pull requests and through reporting bugs or requesting enhancements! :confetti_ball:

### HTML5 client

fixes
* fix: startup crash by @ramonlsouza in https://github.com/bigbluebutton/bigbluebutton/pull/23580
* style: use the same font for firefox and chrome toasts by @ramonlsouza in https://github.com/bigbluebutton/bigbluebutton/pull/23574

plugin related
* feat(learning-dashboard): Add support for markdown rendering in learning-dashboard - plugins table by @GuiLeme in https://github.com/bigbluebutton/bigbluebutton/pull/23566

locales
* Updates for project BigBlueButton v3.0 HTML5 client and language it_IT by @transifex-integration[bot] in https://github.com/bigbluebutton/bigbluebutton/pull/23564
* Updates for project BigBlueButton v3.0 HTML5 client and language de by @transifex-integration[bot] in https://github.com/bigbluebutton/bigbluebutton/pull/23570
* Updates for project BigBlueButton v3.0 HTML5 client and language ja by @transifex-integration[bot] in https://github.com/bigbluebutton/bigbluebutton/pull/23572
* Updates for project BigBlueButton v3.0 HTML5 client and language zh_TW by @transifex-integration[bot] in https://github.com/bigbluebutton/bigbluebutton/pull/23579


### Core
* fix (gql-server): fix trigger to recount chat messages on delete by @gustavotrott in https://github.com/bigbluebutton/bigbluebutton/pull/23573
* refactor (gql-server): Remove unused indexes from the `bbb_graphql` database by @gustavotrott in https://github.com/bigbluebutton/bigbluebutton/pull/23575
* fix (akka-apps): Dynamically adjust poll annotation size based on question length and number of answers by @gustavotrott in https://github.com/bigbluebutton/bigbluebutton/pull/23585

### packaging and configuration
* chore: Update bbb-presentation-video to 5.0.0 by @ramonlsouza in https://github.com/bigbluebutton/bigbluebutton/pull/23582

**Full Changelog**: https://github.com/bigbluebutton/bigbluebutton/compare/v3.0.11...v3.0.12


### Release name

Passing `-v jammy-300` to https://github.com/bigbluebutton/bbb-install/blob/v3.0.x-release/bbb-install.sh will always install the latest released BigBlueButton 3.0 version.  

If for some reason you would like to install this specific release, pass `-v jammy-300-3.0.12`.  

We still recommend using `-v jammy-300` as this repository is continually updated with each BigBlueButton 3.0 release.


### Client build: 1386


## v3.0.11

## What's Changed

This iteration contains various client and server side fixes. 

Below is a list of the pull requests in this iteration, grouped by component.

Link to installation command / instructions/ schedule / planned features : https://docs.bigbluebutton.org/3.0/new-features

Big THANK YOU to all community members who helped for this release - both through sending pull requests and through reporting bugs or requesting enhancements! :confetti_ball:

### HTML5 client

new
* Feat(html5): Add support for quizzes by @Tainan404 in https://github.com/bigbluebutton/bigbluebutton/pull/23506
* feat(bbb-learning-dashboard): Add support for quizzes by @JoVictorNunes in https://github.com/bigbluebutton/bigbluebutton/pull/23504
* feat(html5,akka): Add disable feature for quiz by @Tainan404 in https://github.com/bigbluebutton/bigbluebutton/pull/23516
* Ref(html5): Apply new style to quiz interface by @Tainan404 in https://github.com/bigbluebutton/bigbluebutton/pull/23542
* feat: persist whiteboard tools on unmount by @ramonlsouza in https://github.com/bigbluebutton/bigbluebutton/pull/23539

fixes
* [3.0] fix(audio-captions): transcription stops after a long period of silence  by @Arthurk12 in https://github.com/bigbluebutton/bigbluebutton/pull/23449
* fix(chat): "Start a private chat" menu option is still shown when chat is disabled by @JoVictorNunes in https://github.com/bigbluebutton/bigbluebutton/pull/23433
* fix(livekit): block audio subscription if playback is blocked, autoplay handling is not always triggered by @prlanzarin in https://github.com/bigbluebutton/bigbluebutton/pull/23471
* style: Fix reactions modal too big on mobile by @JoVictorNunes in https://github.com/bigbluebutton/bigbluebutton/pull/23460
* fix(livekit): mute local camera when in "Away" mode by @prlanzarin in https://github.com/bigbluebutton/bigbluebutton/pull/23472
* style: Fix chat spacing when typing indicator is disabled by @JoVictorNunes in https://github.com/bigbluebutton/bigbluebutton/pull/23461
* style: adjust snapshot of current slide and presentation uploader notification styles by @ramonlsouza in https://github.com/bigbluebutton/bigbluebutton/pull/23480
* fix(livekit): stopping one local camera un-shares all instead by @prlanzarin in https://github.com/bigbluebutton/bigbluebutton/pull/23483
* fix(livekit): cached output device isn't correctly applied on join by @prlanzarin in https://github.com/bigbluebutton/bigbluebutton/pull/23490
* fix: typingIndicator.showNames: false does not work by @ramonlsouza in https://github.com/bigbluebutton/bigbluebutton/pull/23463
* Fix(html5): Audio output change causing user to not hear other users by @Tainan404 in https://github.com/bigbluebutton/bigbluebutton/pull/23473
* fix(html5/whiteboard): Tool config fixes by @JoVictorNunes in https://github.com/bigbluebutton/bigbluebutton/pull/23419
* Fix(html5): poll form fields clean up on poll start by @Tainan404 in https://github.com/bigbluebutton/bigbluebutton/pull/23518
* fix(html5): Accessibility recommendations by @JoVictorNunes in https://github.com/bigbluebutton/bigbluebutton/pull/23447
* fix: Breakout room numbers not showing by @ramonlsouza in https://github.com/bigbluebutton/bigbluebutton/pull/23526
* fix(html5): Quiz information isn't saved when navigating between tabs by @Tainan404 in https://github.com/bigbluebutton/bigbluebutton/pull/23524

test
* refactor(ci): Unify artifacts download and extraction process in CI workflow by @antonbsa in https://github.com/bigbluebutton/bigbluebutton/pull/23507
* Validate endpoints and env variables before running all tests by @pinhaum in https://github.com/bigbluebutton/bigbluebutton/pull/23474
* feat(tests): Add dataTest attributes to audio, video, and presentation components for enabling sample plugin tests by @antonbsa in https://github.com/bigbluebutton/bigbluebutton/pull/23388
* chore: Temporarily disable merging and uploading blob reports in CI workflow by @antonbsa in https://github.com/bigbluebutton/bigbluebutton/pull/23517

chore
* chore: Add comment on disableEmojis source for ids by @antobinary in https://github.com/bigbluebutton/bigbluebutton/pull/23430
* chore(html5): include clientSessionUUID in log userInfo by @ramonlsouza in https://github.com/bigbluebutton/bigbluebutton/pull/23505
* chore(client): bump tldraw to 2.0.0-alpha.30 by @ramonlsouza in https://github.com/bigbluebutton/bigbluebutton/pull/23557
* refactor(html5/chat): Log high scroll activity by @JoVictorNunes in https://github.com/bigbluebutton/bigbluebutton/pull/23527
* refactor(bbb-learning-dashboard): Quizzes patch by @JoVictorNunes in https://github.com/bigbluebutton/bigbluebutton/pull/23551

locales
* Updates for project BigBlueButton v3.0 HTML5 client and language ar by @transifex-integration[bot] in https://github.com/bigbluebutton/bigbluebutton/pull/23520
* Updates for project BigBlueButton v3.0 HTML5 client and language it_IT by @transifex-integration[bot] in https://github.com/bigbluebutton/bigbluebutton/pull/23521
* Updates for project BigBlueButton v3.0 HTML5 client and language et by @transifex-integration[bot] in https://github.com/bigbluebutton/bigbluebutton/pull/23530

### Core
* gql-server (perf): Workaround to prevent Hasura from adding redundant nullability checks by @gustavotrott in https://github.com/bigbluebutton/bigbluebutton/pull/23495
* refactor (akka-apps): Ignore unknown properties when reading plugins manifests by @gustavotrott in https://github.com/bigbluebutton/bigbluebutton/pull/23500
* backend (feat): Add support for polls with correct answers (quizzes) by @gustavotrott in https://github.com/bigbluebutton/bigbluebutton/pull/23488
* chore (gql-middleware): Add `clientSessionUUID` to all logs of gql-middleware by @gustavotrott in https://github.com/bigbluebutton/bigbluebutton/pull/23514
* gql-server (perf): Increase performance for chat queries by @gustavotrott in https://github.com/bigbluebutton/bigbluebutton/pull/23494
* Ref(akka,web,docs): Rename disable feature from quiz to quizzes by @Tainan404 in https://github.com/bigbluebutton/bigbluebutton/pull/23519
* feat (akka-apps): Add quiz info to `events.xml` by @gustavotrott in https://github.com/bigbluebutton/bigbluebutton/pull/23529
* feat (LAD): Include user's avatar to Learning Dashboard json data by @gustavotrott in https://github.com/bigbluebutton/bigbluebutton/pull/23538
* refactor (akka): Improve Middleware Health‑check and include INFO logs when database execution is slow by @gustavotrott in https://github.com/bigbluebutton/bigbluebutton/pull/23541

### packaging and configuration
* build(deps): livekit-cli@2.14.0, @livekit/components-react@2.9.12 by @prlanzarin in https://github.com/bigbluebutton/bigbluebutton/pull/23476
* build(bbb-webrtc-sfu): v2.19.0-beta.3 by @prlanzarin in https://github.com/bigbluebutton/bigbluebutton/pull/23481
* build(bbb-webrtc-recorder): v0.10.0 by @prlanzarin in https://github.com/bigbluebutton/bigbluebutton/pull/23502
* build(livekit): livekit/sip@v1.1.1, bbb-webrtc-sfu@v2.19.0-beta.4, bypass guest lobby for dial-ins when using LK audio  by @prlanzarin in https://github.com/bigbluebutton/bigbluebutton/pull/23535

**Full Changelog**: https://github.com/bigbluebutton/bigbluebutton/compare/v3.0.10...v3.0.11


### Release name

Passing `-v jammy-300` to https://github.com/bigbluebutton/bbb-install/blob/v3.0.x-release/bbb-install.sh will always install the latest released BigBlueButton 3.0 version.  

If for some reason you would like to install this specific release, pass `-v jammy-300-3.0.11`.  

We still recommend using `-v jammy-300` as this repository is continually updated with each BigBlueButton 3.0 release.


### Client build: 1380
