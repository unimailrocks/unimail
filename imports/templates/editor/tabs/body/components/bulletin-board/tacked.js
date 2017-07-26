import PropTypes from 'prop-types';
/* eslint-disable react/no-unused-prop-types */
import React, { Component } from 'react';
import Frame from './frame';

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
    bounded: PropTypes.bool,

    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,

    onInteract: PropTypes.func,

    className: PropTypes.string,
    resizeDotClassName: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.string,
    ]),

    frameStyle: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    resizeDotStyle: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.object, // eslint-disable-line react/forbid-prop-types
    ]),

    showFrame: PropTypes.bool,

    // used in BulletinBoard; should not be passed in by consumers
    onBeginTransform: PropTypes.func,
    id: PropTypes.string,
    ancestorTranslation: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }),
  };

  static defaultProps = {
    onMouseEnter: null,
    onMouseLeave: null,
    onInteract: null,
    className: null,
    resizeDotClassName: null,
    showFrame: true,

    frameStyle: null,
    resizeDotStyle: null,


    onBeginTransform() {},
    id: null,
    // ancestorTranslation: null,
    bounded: true,
  };

  static contextTypes = {
    __bb_options: PropTypes.func,
  }

  static childContextTypes = {
    __bb_translation: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }),
    __bb_translationX: PropTypes.number,
    __bb_contextID: PropTypes.string,
    __bb_getTranslation: PropTypes.func,
  }

  getChildContext() {
    const { ancestorTranslation, id } = this.props;
    console.log('%cchanging child context of %s %O', 'color: red', id, ancestorTranslation);
    return {
      __bb_translation: ancestorTranslation,
      __bb_translationX: ancestorTranslation && ancestorTranslation.x,
      __bb_getTranslation: () => this.props.ancestorTranslation,
      __bb_contextID: id,
    };
  }

  getCoordinatesFromEvent(e) {
    const containerCoords = this.container.getBoundingClientRect();
    const relativeCoordinates = {
      x: e.clientX - containerCoords.left,
      y: e.clientY - containerCoords.top,
    };

    return {
      relativeCoordinates,
      mouseCoordinates: {
        x: e.clientX,
        y: e.clientY,
      },
    };
  }

  beginTranslate = e => {
    if (e.button !== 0 || this.context.__bb_options().locked) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();

    this.props.onBeginTransform('translate', this.getCoordinatesFromEvent(e));

    if (this.props.onInteract) {
      this.props.onInteract();
    }
  };

  beginResize = ({ direction, event }) => {
    if (event.button !== 0 || this.context.__bb_options().locked) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.props.onBeginTransform(`resize-${direction}`, this.getCoordinatesFromEvent(event));

    if (this.props.onInteract) {
      this.props.onInteract();
    }
  }

  registerContainer = container => {
    this.container = container;
  };

  render() {
    const {
      height,
      width,
      x,
      y,
      children,
      onMouseEnter,
      onMouseLeave,
      frameStyle,
      className,
      resizeDotClassName,
      resizeDotStyle,
      showFrame,
    } = this.props;

    return (
      <div
        style={{
          height,
          width,
          left: x,
          top: y,
          position: 'absolute',
        }}
        ref={this.registerContainer}
        onMouseDown={this.beginTranslate}
      >
        <Frame
          onResizeBegin={this.beginResize}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          resizeDotClassName={resizeDotClassName}
          resizeDotStyle={resizeDotStyle}
          show={showFrame}
          style={frameStyle}
          className={className}
        />
        {children}
      </div>
    );
  }
}
