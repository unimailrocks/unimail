import React, { Component, PropTypes } from 'react';

export default class Tacked extends Component {
  static propTypes = {
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.element),
      PropTypes.element,
    ]).isRequired,
    onBeginTransform: PropTypes.func,
  };

  static defaultProps = {
    onBeginTransform() {},
  };

  beginTranslate = e => {
    e.preventDefault();
    e.stopPropagation();

    const containerCoords = this.container.getBoundingClientRect();
    const relativeCoordinates = {
      x: e.clientX - containerCoords.left,
      y: e.clientY - containerCoords.top,
    };

    this.props.onBeginTransform('translate', {
      relativeCoordinates,
      mouseCoordinates: {
        x: e.clientX,
        y: e.clientY,
      },
    });
  };

  registerContainer = container => {
    this.container = container;
  };

  render() {
    const { height, width, x, y, children } = this.props;
    return (
      <div
        style={{
          height,
          width,
          left: x,
          top: y,
          position: 'absolute',
        }}
        onMouseDown={this.beginTranslate}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            border: '1px solid black',
            boxSizing: 'border-box',
          }}
          ref={this.registerContainer}
        />
        {children}
      </div>
    );
  }
}
