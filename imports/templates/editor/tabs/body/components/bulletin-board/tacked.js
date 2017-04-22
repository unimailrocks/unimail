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
  };

  render() {
    const { height, width, x, y, children } = this.props;
    console.log('making a Tacked with', this.props);
    return (
      <div
        style={{
          height: px(height),
          width: px(width),
          left: px(x),
          top: px(y),
          position: 'absolute',
          border: '1px solid black',
        }}
      >
        {children}
      </div>
    );
  }
}
