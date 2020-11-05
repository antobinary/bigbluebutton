import { check } from 'meteor/check';
import Presentations from '/imports/api/presentations';
import { Slides } from '/imports/api/slides';
import probe from 'probe-image-size';
import Logger from '/imports/startup/server/logger';
import flat from 'flat';
import { HTTP } from 'meteor/http';
import setCurrentPresentation from './setCurrentPresentation';
import { SVG, PNG } from '/imports/utils/mimeTypes';
import calculateSlideData from '/imports/api/slides/server/helpers';
import addSlidePositions from '../../../slides/server/modifiers/addSlidePositions';

const GENERATED_SLIDE_KEY = 'GENERATED_SLIDE';

const loadSlidesFromHttpAlways = Meteor.settings.private.app.loadSlidesFromHttpAlways || false;

const requestWhiteboardHistory = (meetingId, slideId) => {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'GetWhiteboardAnnotationsReqMsg';
  const USER_ID = 'nodeJSapp';

  const payload = {
    whiteboardId: slideId,
  };

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, USER_ID, payload);
};

const SUPPORTED_TYPES = [SVG, PNG];

const fetchImageSizes = async imageUri => probe(imageUri)
  .then((result) => {
    if (!SUPPORTED_TYPES.includes(result.mime)) {
      throw new Meteor.Error('invalid-image-type', `received ${result.mime} expecting ${SUPPORTED_TYPES.join()}`);
    }

    return {
      width: result.width,
      height: result.height,
    };
  })
  .catch((reason) => {
    Logger.error(`Error parsing image size. ${reason}. uri=${imageUri}`);
    return reason;
  });

const getSlideText = async (url) => {
  let content = '';
  try {
    content = await HTTP.get(url).content;
  } catch (error) {
    Logger.error(`No file found. ${error}`);
  }
  return content;
};

export default async function addPresentationPage(meetingId, body) {
  const {
    podId, presentationId, page, numberOfPages, pagesCompleted, presName,
  } = body;
  check(podId, String);
  check(presentationId, String);
  check(page, {
    id: String,
    num: Number,
    urls: {
      svg: String,
      png: String,
      thumb: String,
      text: String,
      swf: String,
    },
    current: Boolean,
    xOffset: Number,
    yOffset: Number,
    widthRatio: Number,
    heightRatio: Number,
  });

  const content = await getSlideText(page.urls.text);

  const presentationSelector = {
    meetingId,
    podId,
    id: presentationId,
  };

  const test = Slides.find({ presentationId, meetingId, podId }).fetch();
  console.log('()()()()(()()()()()(()()()()()())()()()()(');
  console.log(test);
  console.log('()()()()(()()()()()(()()()()()())()()()()(');

  const presentationModifier = {
    meetingId,
    podId,
    id: presentationId,
    filename: presName,
    name: presName,
    numberOfPages,
    pagesCompleted,
    pages: test,
    conversion: {
      status: GENERATED_SLIDE_KEY,
      error: false,
    },
  };

  const cb1 = (err) => {
    if (err) {
      return Logger.error(`Updating presentation collection: ${err}`);
    }

    return Logger.info(`Upserted presentation id=${presentationId} meetingId=${meetingId}`);
  };

  Presentations.upsert(presentationSelector, presentationModifier, cb1);

  return fetchImageSizes(page.urls.svg || page.urls.png)
    .then(({ width, height }) => {
      // there is a rare case when for a very long not-active meeting the presentation
      // files just disappear and width/height can't be retrieved
      if (width && height) {
        // pre-calculating the width, height, and vieBox coordinates / dimensions
        // to unload the client-side
        const slideData = {
          width,
          height,
          xOffset: page.xOffset,
          yOffset: page.yOffset,
          widthRatio: page.widthRatio,
          heightRatio: page.heightRatio,
        };

        const slidePosition = calculateSlideData(slideData);

        addSlidePositions(meetingId, podId, presentationId, page.id, slidePosition);
      }

      const pageSelector = {
        meetingId,
        podId,
        presentationId,
        id: page.id,
      };

      const pageModifier = {
        $set: Object.assign({
          meetingId,
          podId,
          presentationId,
          content,
        }, flat(page, { safe: true })),
      };

      const cb = (err) => {
        if (err) {
          return Logger.error(`Adding presentation page to collection: ${err}`);
        }

        //   if (page.num === 1) {
        //     let test = Presentations.findOne({ id: presentationId, meetingId, podId })
        //      console.log('()()()()(()()()()()(()()()()()())()()()()(')
        //      console.log(test)
        //      console.log('()()()()(()()()()()(()()()()()())()()()()(')
        //     setCurrentPresentation(meetingId, podId, presentationId);
        //    }

        return Logger.info(`Upserted presentation page id=${page.id} presentationId=${presentationId} meetingId=${meetingId}`);
      };

      return Slides.upsert(pageSelector, pageModifier, cb);
    })
    .catch(reason => Logger.error(`Error parsing image size. ${reason}. slide=${page.id} uri=${page.urls.svg || page.urls.png}`));
}
