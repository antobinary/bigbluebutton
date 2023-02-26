import RedisPubSub from '/imports/startup/server/redis';
import handleSlideResize from './handlers/slideResize';

RedisPubSub.on('ResizeAndMovePageEvtMsg', handleSlideResize);
