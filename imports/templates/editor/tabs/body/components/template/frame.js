import React from 'react';
import PropTypes from 'prop-types';
import { css, StyleSheet } from 'aphrodite';

import UnimailPropTypes from '/imports/prop-types';
import colors from '/imports/styles/colors';

const stylesheet = StyleSheet.create({
  frame: {
    ':hover': {
      boxShadow: `0 0 1em ${colors.blue.alpha(0.5).toString()}`,
    },
  },
});

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
  minimal,
  style,
  onResizeBegin,
  ...divProps
}) {
  const circles = minimal ? null : config.map(options => {
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
        onMouseDown={
          e => onResizeBegin({
            event: e,
            direction: options.direction,
          })
        }
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
          ...style,
        }}
        {...divProps}
        className={css(stylesheet.frame)}
      >
        {circles}
      </div>
      {children}
    </div>
  );
}

Frame.propTypes = {
  children: UnimailPropTypes.children.isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  minimal: PropTypes.bool,
  style: UnimailPropTypes.style,
  onResizeBegin(props, propName) { // eslint-disable-line react/require-default-props
    if (props.minimal) {
      return;
    }

    if (!props[propName]) {
      throw new Error('onResizeBegin must be specified on non-minimal Frame');
    }
  },
};

Frame.defaultProps = {
  style: {},
  minimal: false,
};
