import React, { PropTypes } from 'react';

export default class LineDrawComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var style = {
      WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
    };
    return (

      //stroke and stroke-width might be inside of the style
      <line
        x1=""
        y1=""
        x2=""
        y2=""
        stroke=""
        stroke-width=""
        style={style}
      />
    );
  }
}
