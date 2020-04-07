import Logger from '/imports/startup/server/logger';
import AuthTokenValidation from '/imports/api/auth-token-validation';

// selector follows the format {meetingId, userId, connectionId, validationStatus}
export default function upsertValidationState(meetingId, userId, validationStatus, connectionId) {
  const selector = {
    meetingId, userId, connectionId,
  };
  const modifier = {
    $set: {
      meetingId,
      userId,
      connectionId,
      validationStatus,
    },
  };
  const cb = (err, numChanged) => {
    if (err) {
      Logger.error(`Could not upsert to collection AuthTokenValidation: ${err}`);
      return;
    }
    if (numChanged) {
      console.info(`Upserted ${JSON.stringify(selector)} ${validationStatus} in AuthTokenValidation`);
      // Logger.debug(`Upserted ${selector.toString()} in AuthTokenValidation`);
    }
  };

  return AuthTokenValidation.upsert(selector, modifier, cb);
}




// calculating the font size in this if / else block
if (fontSizeDirection !== 0) {
  const key = `${annotation.id}_key_${currentLine}`;
  const votes = `${annotation.id}_votes_${currentLine}`;
  const percent = `${annotation.id}_percent_${currentLine}`;
  const keySizes = this[key].getBBox();
  const voteSizes = this[votes].getBBox();
  const percSizes = this[percent].getBBox();

  // first check if we can still increase the font-size
  if (fontSizeDirection === 1) {
    if (keySizes.width < maxLineWidth && keySizes.height < maxLineHeight
      && voteSizes.width < maxLineWidth && voteSizes.height < maxLineHeight
      && percSizes.width < maxLineWidth && percSizes.height < maxLineHeight) {
      return this.setState({
        calcFontSize: calcFontSize + 1,
      });

      // we can't increase font-size anymore, start decreasing
    }
    return this.setState({
      fontSizeDirection: -1,
      calcFontSize: calcFontSize - 1,
    });
  } if (fontSizeDirection === -1) {
    // check if the font-size is still bigger than allowed
    if (keySizes.width > maxLineWidth || keySizes.height > maxLineHeight
      || voteSizes.width > maxLineWidth || voteSizes.height > maxLineHeight
      || percSizes.width > maxLineWidth || percSizes.height > maxLineHeight) {
      return this.setState({
        calcFontSize: calcFontSize - 1,
      });

      // font size is fine for the current line, switch to the next line
      // or finish with the font-size calculations if this we are at the end of the array
    }
    if (currentLine < textArray.length - 1) {
      return this.setState({
        currentLine: currentLine + 1,
        lineToMeasure: textArray[currentLine + 1],
      });
    }
    return this.setState({
      fontSizeDirection: 0,
      currentLine: 0,
      lineToMeasure: textArray[0],
    });
  }
}
