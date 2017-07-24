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
  };

  static contextTypes = {
    __bb_options: PropTypes.func,
  }

  static defaultProps = {
    onBeginTransform() {},
    id: null,
    ancestorTranslation: null,
    bounded: true,
  };

  static childContextTypes = {
    __bb_translation: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }),
    __bb_contextID: PropTypes.string,
  }

  getChildContext() {
    const { ancestorTranslation, id } = this.props;
    return {
      __bb_translation: ancestorTranslation,
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
        />
        {children}
      </div>
    );
  }
}
