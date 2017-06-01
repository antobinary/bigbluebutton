/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 *
 */
package org.bigbluebutton.red5.service;

import java.util.Map;
import org.red5.server.api.Red5;
import org.red5.server.api.scope.IScope;
import org.bigbluebutton.red5.BigBlueButtonSession;
import org.bigbluebutton.red5.Constants;

public class PresentationService {	

  private PresentationApplication presentationApplication;

  public void removePresentation(Map<String, Object> msg) {
    String presentationID = (String) msg.get("presentationID");

    IScope scope = Red5.getConnectionLocal().getScope();
    presentationApplication.removePresentation(scope.getName(), presentationID);
  }

  public void getSlideInfo() {
    IScope scope = Red5.getConnectionLocal().getScope();
    presentationApplication.getSlideInfo(scope.getName(), getBbbSession().getInternalUserID());		
  }

  public void clear() {
    IScope scope = Red5.getConnectionLocal().getScope();
    presentationApplication.clear(scope.getName());
  }

  public void getPresentationInfo() {
    IScope scope = Red5.getConnectionLocal().getScope();
    presentationApplication.getPresentationInfo(scope.getName(), getBbbSession().getInternalUserID());
  }

  public void gotoSlide(Map<String, Object> msg) {
    String pageId = (String) msg.get("page");

    IScope scope = Red5.getConnectionLocal().getScope();
    presentationApplication.gotoSlide(scope.getName(), pageId);
  }

  public void sharePresentation(Map<String, Object> msg) {
    String presentationID = (String) msg.get("presentationID");
    Boolean share = (Boolean) msg.get("share");

    IScope scope = Red5.getConnectionLocal().getScope();
    presentationApplication.sharePresentation(scope.getName(), presentationID, share);
  }

  public void resizeAndMoveSlide(Map<String, Object> msg) {
    Double xOffset;
    if (msg.get("xOffset") instanceof Integer) {
      Integer tempXOffset = (Integer) msg.get("xOffset");
      xOffset = tempXOffset.doubleValue();
    } else {
      xOffset = (Double) msg.get("xOffset");
    }
    if (Double.isNaN(xOffset)) {
     // log.warn("resizeAndMoveSlide came with xOffset as NaN, setting it to 0");
      xOffset = 0.0;
    }

    Double yOffset;

    if (msg.get("yOffset") instanceof Integer) {
      Integer tempYOffset = (Integer) msg.get("yOffset");
      yOffset = tempYOffset.doubleValue();
    } else {
      yOffset = (Double) msg.get("yOffset");
    }
    if (Double.isNaN(yOffset)) {
      //log.warn("resizeAndMoveSlide came with yOffset as NaN, setting it to 0");
      yOffset = 0.0;
    }

    Double widthRatio;
    if (msg.get("widthRatio") instanceof Integer) {
      Integer tempWRatio = (Integer) msg.get("widthRatio");
      widthRatio = tempWRatio.doubleValue();
    } else {
      widthRatio = (Double) msg.get("widthRatio");
    }
    if (Double.isNaN(widthRatio)) {
     // log.warn("resizeAndMoveSlide came with widthRatio as NaN, setting it to 100");
      widthRatio = 100.0;
    }


    Double heightRatio;
    if (msg.get("heightRatio") instanceof Integer) {
      Integer tempHRatio = (Integer) msg.get("heightRatio");
      heightRatio = tempHRatio.doubleValue();
    } else {
      heightRatio = (Double) msg.get("heightRatio");
    }
    if (Double.isNaN(heightRatio)) {
      //log.warn("resizeAndMoveSlide came with heightRatio as NaN, setting it to 100");
      heightRatio = 100.0;
    }

    IScope scope = Red5.getConnectionLocal().getScope();
    presentationApplication.resizeAndMoveSlide(scope.getName(), xOffset, yOffset, widthRatio, heightRatio);
  }

  public void setPresentationApplication(PresentationApplication a) {
    presentationApplication = a;
  }

  private BigBlueButtonSession getBbbSession() {
    return (BigBlueButtonSession) Red5.getConnectionLocal().getAttribute(Constants.SESSION);
  }
}