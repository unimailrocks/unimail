import React, { Component, PropTypes } from 'react';
import Tacked from './tacked';

const { min, max, abs } = Math;

export { Tacked };

export default class BulletinBoard extends Component {
  static propTypes = {
    className: PropTypes.string,
    heightLocked: PropTypes.bool,
    widthLocked: PropTypes.bool,
    minHeight: PropTypes.number,
    children(props, propName, componentName) {
      const children = props[propName];
      const keys = {};
      React.Children.forEach(children, child => {
        if (!child.key) {
          throw new Error(`No key found on child in ${componentName}`);
        }
        if (keys[child.key]) {
          throw new Error(`Duplicate child key "${child.key} found in ${componentName}"`);
        }

        keys[child.key] = true;
      });
    },
  };

  static defaultProps = {
    className: '',
    heightLocked: false,
    widthLocked: false,
    children: [],
    minHeight: 0,
  };

  state = {
    detachedChild: null,
  };

  onMouseMove = e => {
    if (!this.state.detachedChild) {
      return;
    }

    const mouseCoordinates = { x: e.clientX, y: e.clientY };
    this.setState(state => ({
      ...state,
      mouseCoordinates,
    }));
  }

  onMouseUp = e => {
    const mouseCoordinates = { x: e.clientX, y: e.clientY };
  };

  getDetachedBounds() {
    return this.container && this.container.getBoundingClientRect();
  }

  calculateHeight() {
    const { children, minHeight } = this.props;
    const bottoms = React.Children.map(children, ({ props }) => props.y + props.height);

    return Math.max(...bottoms, minHeight);
  }

  clampToDetachedBounds(point) {
    const detachedBounds = this.getDetachedBounds();

    return {
      y: max(min(point.y, detachedBounds.bottom), detachedBounds.top),
      x: max(min(point.x, detachedBounds.right), detachedBounds.left),
    };
  }

  detachedChildPosition(mouseCoordinates) {
    const { detachedChild, detachedMouseCoordinates } = this.state;
    const ostensiblePosition = {
      x: mouseCoordinates.x - detachedMouseCoordinates.x,
      y: mouseCoordinates.y - detachedMouseCoordinates.y,
    };

    const detachedBounds = this.getDetachedBounds();
    const { width, height } = detachedChild.props;
    return {
      left: max(min(ostensiblePosition.x, detachedBounds.right - width), detachedBounds.left),
      top: max(min(ostensiblePosition.y, detachedBounds.bottom - height), detachedBounds.top),
      width,
      height,
    };
  }

  detachChild(child) {
    return (relativeCoordinates, mouseCoordinates) => {
      this.setState(state => ({
        ...state,
        detachedChild: child,
        detachedMouseCoordinates: relativeCoordinates,
        mouseCoordinates,
      }));
    };
  }

  transformChildren(children) {
    const { detachedChild } = this.state;
    return React.Children.map(children, child => {
      if (detachedChild && child.key === detachedChild.key) {
        return null;
      }
      return React.cloneElement(child, {
        onMouseDown: this.detachChild(child),
      });
    });
  }

  registerContainer = container => {
    this.container = container;
  };

  renderDetachedChild() {
    const { detachedChild, mouseCoordinates } = this.state;
    if (!detachedChild) {
      return null;
    }
    const untacked = React.cloneElement(detachedChild, {
      x: 0,
      y: 0,
    });

    const { width, height, top, left } = this.detachedChildPosition(mouseCoordinates);

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          left: 0,
          bottom: 0,
        }}
        onMouseMove={this.onMouseMove}
      >
        <div
          style={{
            backgroundColor: 'green',
            position: 'absolute',
            top,
            left,
            width,
            height,
          }}
        >{untacked}</div>
      </div>
    );
  }

  render() {
    const { className, children } = this.props;
    return (
      <div
        ref={this.registerContainer}
        className={className}
        style={{ minHeight: `${this.calculateHeight()}px` }}
      >
        {this.transformChildren(children)}
        {this.renderDetachedChild()}
      </div>
    );
  }
}
