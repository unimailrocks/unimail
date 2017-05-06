import React, { Component, PropTypes } from 'react';

const px = x => `${x}px`;

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
    onMouseDown: PropTypes.func,
  };

  static defaultProps = {
    onMouseDown() {},
  };

  onMouseDown = e => {
    e.preventDefault();
    e.stopPropagation();

    const containerCoords = this.container.getBoundingClientRect();
    const relativeCoords = {
      x: e.clientX - containerCoords.left,
      y: e.clientY - containerCoords.top,
    };

    this.props.onMouseDown(relativeCoords, { x: e.clientX, y: e.clientY });
  };

  registerContainer = container => {
    this.container = container;
  };

  render() {
    const { height, width, x, y, children } = this.props;
    return (
      <div>
        <div
          style={{
            height,
            width,
            left: x,
            top: y,
            position: 'absolute',
            border: '3px solid black',
            boxSizing: 'border-box',
          }}
        />
        <div
          ref={this.registerContainer}
          onMouseDown={this.onMouseDown}
          style={{
            position: 'absolute',
            top: y,
            left: x,
            height,
            width,
          }}
        >
          {children}
        </div>

      </div>
    );
  }
}
