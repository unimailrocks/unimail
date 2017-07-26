import React from 'react';
import PropTypes from 'prop-types';

function Circle({ style, onMouseDown }) {
  return (
    <svg
      viewBox={'0 0 100 100'}
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      onMouseDown={onMouseDown}
    >
      <circle cx="50" cy="50" r="50" />
    </svg>
  );
}

Circle.propTypes = {
  style: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onMouseDown: PropTypes.func.isRequired,
};

const config = [
  { top: 0, left: 0, cursor: 'nwse-resize', direction: 'ul' },
  { top: 0, left: '50%', cursor: 'ns-resize', direction: 'u' },
  { top: 0, left: '100%', cursor: 'nesw-resize', direction: 'ur' },
  { top: '50%', left: '100%', cursor: 'ew-resize', direction: 'r' },
  { top: '100%', left: '100%', cursor: 'nwse-resize', direction: 'dr' },
  { top: '100%', left: '50%', cursor: 'ns-resize', direction: 'd' },
  { top: '100%', left: 0, cursor: 'nesw-resize', direction: 'dl' },
  { top: '50%', left: 0, cursor: 'ew-resize', direction: 'l' },
];

export default function Frame({
  children,
  x,
  y,
  height,
  width,
  ...divProps
}) {
  const circles = config.map(options => {
    const style = {
      position: 'absolute',
      width: 7,
      transform: 'translate(-50%, -50%)',
      height: 7,
      ...options,
    };

    return (
      <Circle
        style={style}
        key={options.direction}
      />
    );
  });


  return (
    <div
      style={{
        height,
        width,
        left: x,
        top: y,
        position: 'absolute',
      }}
    >
      <div
        style={{
          border: '1px solid black',
          boxSizing: 'border-box',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          position: 'absolute',
        }}
        {...divProps}
      >
        {circles}
      </div>
      {children}
    </div>
  );
}
