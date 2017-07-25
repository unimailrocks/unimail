import PropTypes from 'prop-types';
import React, { Component } from 'react';

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

export default class Frame extends Component {
  static propTypes = {
    onResizeBegin: PropTypes.func.isRequired,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,

    className: PropTypes.string,
    resizeDotClassName: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.string,
    ]),

    style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    resizeDotStyle: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.object, // eslint-disable-line react/forbid-prop-types
    ]),

    show: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    onMouseEnter: null,
    onMouseLeave: null,
    className: null,
    resizeDotClassName: null,
    frameStyle: null,
    resizeDotStyle: null,
  };

  resizeDotMouseDown = direction => event => {
    this.props.onResizeBegin({ direction, event });
  }

  render() {
    const {
      resizeDotStyle,
      style,
      resizeDotClassName,
      className,
      show,
      onMouseEnter,
      onMouseLeave,
    } = this.props;

    const circles = show ? config.map(options => {
      let style = {
        position: 'absolute',
        width: 7,
        transform: 'translate(-50%, -50%)',
        height: 7,
        ...options,
      };

      if (typeof resizeDotStyle === 'function') {
        style = resizeDotStyle(style);
      } else if (resizeDotStyle != null && typeof resizeDotStyle === 'object') {
        style = resizeDotStyle;
      }

      let className = '';
      if (typeof resizeDotClassName === 'function') {
        className = resizeDotClassName(options);
      } else if (typeof resizeDotClassName === 'string') {
        className = resizeDotClassName;
      }

      return (
        <Circle
          style={style}
          onMouseDown={this.resizeDotMouseDown(options.direction)}
          key={options.direction}
          className={className}
        />
      );
    }) : null;

    const defaultStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      boxSizing: 'border-box',
    };

    if (show) {
      defaultStyle.border = '1px solid black';
    }

    let finalStyle = defaultStyle;
    if (typeof style === 'function') {
      finalStyle = style(finalStyle);
    } else if (style != null && typeof style === 'object') {
      finalStyle = style;
    }

    return (
      <div
        style={finalStyle}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={className}
      >{circles}</div>
    );
  }
}
