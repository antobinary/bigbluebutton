import React from 'react';
import {isVideoBroadcasting, presenterDeskshareHasEnded,
  presenterDeskshareHasStarted} from './service';
import { createContainer } from 'meteor/react-meteor-data';
import DeskshareComponent from './component';
import DeskshareService from '/imports/ui/components/deskshare/service';

class DeskshareContainer extends React.Component {
  render() {
    if (this.props.isVideoBroadcasting()) {
      return <DeskshareComponent {...this.props} />;
    }
  }

  componentWillUnmount() {
    this.props.presenterDeskshareHasEnded();
  }

}

export default createContainer(() => {
  DeskshareService.init();
  return {
    isVideoBroadcasting,
    presenterDeskshareHasStarted,
    presenterDeskshareHasEnded,
  };
}, DeskshareContainer);

