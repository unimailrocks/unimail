import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Dimensions from 'react-container-dimensions';
import color from 'color';

import UnimailPropTypes from '/imports/prop-types';
import colors from '/imports/styles/colors';
import { selectTool } from '../../../duck';

const { max, min, abs } = Math;

class DrawingCanvas extends Component {
  static propTypes = {
    tool: UnimailPropTypes.tool,
    releaseTool: PropTypes.func.isRequired,
    onDraw: PropTypes.func.isRequired,
    testDraw: PropTypes.func,
  };

  static defaultProps = {
    tool: null,
    testDraw: () => true,
  };

  static activeTools = [
    'draw-image',
    'draw-container',
    'select-box',
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
    const initialX1 = min(point1.x, point2.x);
    const initialY1 = min(point1.y, point2.y);
    const x1 = max(min(initialX1, this.canvas.width), 0);
    const y1 = max(min(initialY1, this.canvas.height), 0);

    const initialX2 = max(point1.x, point2.x);
    const initialY2 = max(point1.y, point2.y);
    const x2 = max(min(initialX2, this.canvas.width), 0);
    const y2 = max(min(initialY2, this.canvas.height), 0);

    const initialWidth = initialX2 - initialX1;
    const initialHeight = initialY2 - initialY1;
    const width = initialWidth - abs(initialX2 - x2) - abs(initialX1 - x1);
    const height = initialHeight - abs(initialY2 - y2) - abs(initialY1 - y1);
    return { x: x1, y: y1, width, height };
  }

  clearCanvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // for drawing the rectangle when you're using the 'draw-image' tool
  drawImage(rectangle) {
    if (this.props.testDraw(rectangle)) {
      this.context.fillStyle = colors.grey4.alpha(0.5).string();
    } else {
      this.context.fillStyle = colors.red.alpha(0.3).string();
    }

    this.clearCanvas();
    this.context.beginPath();
    this.context.rect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
    this.context.fill();
    this.context.closePath();
  }

  drawContainer(rectangle) {
    if (this.props.testDraw(rectangle)) {
      this.context.strokeStyle = colors.grey4;
      this.context.fillStyle = colors.white.alpha(0.5).string();
    } else {
      this.context.strokeStyle = colors.red.alpha(0.8).string();
      this.context.fillStyle = colors.red.alpha(0.3).string();
    }

    this.clearCanvas();
    this.context.beginPath();
    this.context.rect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
    this.context.stroke();
    this.context.fill();
    this.context.closePath();
  }

  drawSelectBox(rectangle) {
    this.clearCanvas();
    this.context.beginPath();
    this.context.setLineDash([4, 4]);
    this.context.strokeStyle = colors.grey4.alpha(0.8).string();
    this.context.rect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
    this.context.stroke();
    this.context.closePath();
  }

  // handles when the mouse moves while clicked
  handleDraw = e => {
    if (!this.drawing) {
      return;
    }

    this.clearCanvas();
    const { tool } = this.props;
    const coordinates = this.absoluteToRelativeCoordinates(e);
    const rectangle = this.calculateRectangle(coordinates, this.start);
    if (tool === 'draw-image') {
      this.drawImage(rectangle);
    } else if (tool === 'draw-container') {
      this.drawContainer(rectangle);
    } else if (tool === 'select-box') {
      this.drawSelectBox(rectangle);
    }
  };

  // handles when the mouse clicks down
  handleDrawStart = e => {
    if (e.buttons === 2 || e.buttons === 3) {
      return;
    }
    this.drawing = true;
    this.start = this.absoluteToRelativeCoordinates(e);
    if (this.start.x < 0 || this.start.x > this.canvas.width || this.start.y < 0) {
      this.releaseTool();
    }
    const { tool } = this.props;
    if (tool === 'draw-image') {
      this.context.fillStyle = colors.grey4;
    } else if (tool === 'draw-container') {
      this.context.strokeStyle = colors.grey4;
    }
  }

  // handles when the mouse lifts up
  handleDrawFinish = e => {
    this.drawing = false;
    this.end = this.absoluteToRelativeCoordinates(e);
    this.clearCanvas();

    const { tool } = this.props;
    if (tool === 'draw-image') {
      this.props.onDraw({
        placement: this.calculateRectangle(this.start, this.end),
        type: 'image',
      });
    } else if (tool === 'draw-container') {
      this.props.onDraw({
        placement: this.calculateRectangle(this.start, this.end),
        type: 'container',
      });
    } else if (tool === 'select-box') {
      this.props.onDraw({
        placement: this.calculateRectangle(this.start, this.end),
      });
    }
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
            zIndex: 10,
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
