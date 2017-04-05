import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Dimensions from 'react-container-dimensions';

import UnimailPropTypes from '/imports/prop-types';
import colors from '/imports/styles/colors';
import { selectTool } from '../../duck';

const { max, min, abs } = Math;

class DrawingCanvas extends Component {
  static propTypes = {
    tool: UnimailPropTypes.tool,
    releaseTool: PropTypes.func.isRequired,
    onDraw: PropTypes.func.isRequired,
  };

  static defaultProps = {
    tool: null,
  };

  static activeTools = [
    'draw-image',
  ];

  registerCanvas = c => {
    if (!c) {
      return;
    }
    this.canvas = c;
    this.context = c.getContext('2d');
  }

  absoluteToRelativeCoordinates(e) {
    const canvasCoords = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - canvasCoords.left,
      y: e.clientY - canvasCoords.top,
    };
  }

  calculateRectangle(point1, point2) {
    const initialX = min(point1.x, point2.x);
    const initialY = min(point1.y, point2.y);
    const x = max(min(initialX, this.canvas.width), 0);
    const y = max(min(initialY, this.canvas.height), 0);

    const initialWidth = abs(point1.x - point2.x);
    const initialHeight = abs(point1.y - point2.y);
    const width = initialWidth - abs(initialX - x);
    const height = initialHeight - abs(initialY - y);
    return { x, y, width, height };
  }

  // for drawing the rectangle when you're using the 'draw-image' tool
  drawImage(rectangle) {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.beginPath();
    this.context.rect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
    this.context.fill();
    this.context.closePath();
  }

  // handles when the mouse moves while clicked
  handleDraw = e => {
    if (!this.drawing) {
      return;
    }

    const { tool } = this.props;
    if (tool === 'draw-image') {
      const coordinates = this.absoluteToRelativeCoordinates(e);
      this.drawImage(this.calculateRectangle(coordinates, this.start));
    }
  };

  // handles when the mouse clicks down
  handleDrawStart = e => {
    if (e.buttons === 2 || e.buttons === 3) {
      return;
    }
    this.drawing = true;
    this.start = this.absoluteToRelativeCoordinates(e);
    const { tool } = this.props;
    if (tool === 'draw-image') {
      this.context.fillStyle = colors.grey4;
    }
  }

  // handles when the mouse lifts up
  handleDrawFinish = e => {
    this.drawing = false;
    this.end = this.absoluteToRelativeCoordinates(e);

    const { tool } = this.props;
    if (tool === 'draw-image') {
      this.props.onDraw({
        placement: this.calculateRectangle(this.start, this.end),
        type: 'image',
      });
    }

    this.releaseTool();
  };

  releaseTool = e => {
    if (e) {
      e.preventDefault();
    }
    this.props.releaseTool();
  }

  render() {
    if (!DrawingCanvas.activeTools.includes(this.props.tool)) {
      return null;
    }

    return (
      <div
        style={{
          height: '100%',
          width: '100%',
          position: 'absolute',
        }}
      >
        <Dimensions>
          {
            ({ height, width }) => (
              <canvas
                style={{
                  position: 'absolute',
                }}
                height={height}
                width={width}
                ref={this.registerCanvas}
              />
            )
          }
        </Dimensions>
        {/* the drawing pad */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            cursor: 'crosshair',
          }}
          onMouseDown={this.handleDrawStart}
          onMouseUp={this.handleDrawFinish}
          onMouseMove={this.handleDraw}
          onContextMenu={this.releaseTool}
        />
      </div>
    );
  }
}

function mapStateToProps({ editor }) {
  return {
    tool: editor.tool,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    releaseTool() {
      dispatch(selectTool(null));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DrawingCanvas);

