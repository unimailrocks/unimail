import React, { Component, PropTypes } from 'react';

function Circle({ style }) {
  return (
    <svg
      viewBox={'0 0 100 100'}
      xmlns="http://www.w3.org/2000/svg"
      style={style}
    >
      <circle cx="50" cy="50" r="50" />
    </svg>
  );
}

Circle.propTypes = {
  style: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const config = [
  { top: 0, left: 0, cursor: 'nwse-resize', direction: 'ul' },
  { top: 0, left: '50%', cursor: 'ns-resize', direction: 'u' },
  { top: 0, left: '100%', cursor: 'nesw-resize', direction: 'ur' },
  { top: '50%', left: '100%', cursor: 'ew-resize', direction: 'tl' },
  { top: '100%', left: '100%', cursor: 'nwse-resize', direction: 'dr' },
  { top: '100%', left: '50%', cursor: 'ns-resize', direction: 'd' },
  { top: '100%', left: 0, cursor: 'nesw-resize', direction: 'dl' },
  { top: '50%', left: 0, cursor: 'ew-resize', direction: 'l' },
];

export default class Frame extends Component {
  render() {
    const circles = config.map(options => {
      console.log(options.direction);
      return Circle({
        style: {
          position: 'absolute',
          width: 7,
          transform: 'translate(-50%, -50%)',
          height: 7,
          ...options,
        },
      });
    });

    return (
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
      >{circles}</div>
    );
  }
}
