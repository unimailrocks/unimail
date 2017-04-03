import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Dimensions from 'react-container-dimensions';

import UnimailPropTypes from '/imports/prop-types';

class DrawingCanvas extends Component {
  static propTypes = {
    tool: UnimailPropTypes.tool,
  };

  static defaultProps = {
    tool: null,
  };

  static activeTools = [
    'draw-image',
  ];

  render() {
    if (!DrawingCanvas.activeTools.includes(this.props.tool)) {
      return null;
    }

    return (
      <Dimensions>
        {
          ({ height, width }) => (
            <canvas
              style={{
                position: 'absolute',
              }}
              height={height}
              width={width}
              ref={c => { this.canvas = c; }}
            />
          )
        }
      </Dimensions>
    );
  }
}

function mapStateToProps({ editor }) {
  return {
    tool: editor.tool,
  };
}

export default connect(mapStateToProps)(DrawingCanvas);
