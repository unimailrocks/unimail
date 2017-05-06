import React, { Component, PropTypes } from 'react';
import Tacked from './tacked';

const { min, max } = Math;

export { Tacked };

export default class BulletinBoard extends Component {
  static propTypes = {
    className: PropTypes.string,
    heightLocked: PropTypes.bool,
    widthLocked: PropTypes.bool,
    minHeight: PropTypes.number,
    fit: PropTypes.bool,
    id: PropTypes.string,
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
    onRetack: PropTypes.func,
  };

  static defaultProps = {
    className: '',
    heightLocked: false,
    widthLocked: false,
    children: [],
    minHeight: 0,
    onRetack: null,
    fit: false,
    id: null,
  };

  static childContextTypes = {
    __bb_shapeItem: PropTypes.func,
  };

  static contextTypes = {
    __bb_shapeItem: PropTypes.func,
  };

  state = {
    detachedChild: null,
  };

  getChildContext() {
    return {
      __bb_shapeItem: this.shapeItem,
    };
  }

  onMouseMove = e => {
    if (!this.state.detachedChild) {
      return;
    }

    const mouseCoordinates = { x: e.clientX, y: e.clientY };
    this.setState(() => ({
      mouseCoordinates,
    }));
  }

  onMouseUp = async e => {
    const { detachedChild } = this.state;
    const mouseCoordinates = { x: e.clientX, y: e.clientY };

    const path = [detachedChild.key];

    const fixedPosition = this.detachedChildPosition(mouseCoordinates);
    const canvasPosition = this.getCanvasBounds();
    const newPosition = {
      x: fixedPosition.x - canvasPosition.x,
      y: fixedPosition.y - canvasPosition.y,
      width: fixedPosition.width,
      height: fixedPosition.height,
    };

    await this.shapeItem({
      path,
      newPosition,
    });

    this.setState(() => ({
      detachedChild: null,
      detachedMouseCoordinates: null,
    }));
  };

  getCanvasBounds() {
    if (!this.container) {
      return null;
    }

    const bounds = this.container.getBoundingClientRect();

    return {
      x: bounds.left,
      y: bounds.top,
      width: bounds.width,
      height: bounds.height,
    };
  }

  calculateMinHeight() {
    const { children, minHeight } = this.props;
    const bottoms = React.Children.map(children, ({ props }) => props.y + props.height);

    const minPx = Math.max(...bottoms, minHeight);
    return `${minPx}px`;
  }

  calculateHeight() {
    const { fit } = this.props;
    if (fit) {
      return '100%';
    }

    return null;
  }

  detachedChildPosition(mouseCoordinates) {
    const { detachedChild, detachedMouseCoordinates } = this.state;
    const ostensiblePosition = {
      x: mouseCoordinates.x - detachedMouseCoordinates.x,
      y: mouseCoordinates.y - detachedMouseCoordinates.y,
    };

    const detachedBounds = this.getCanvasBounds();
    const { width, height } = detachedChild.props;
    return {
      x: max(
        min(
          ostensiblePosition.x,
          (detachedBounds.x + detachedBounds.width) - width,
        ),
        detachedBounds.x,
      ),
      y: max(
        min(
          ostensiblePosition.y,
          (detachedBounds.y + detachedBounds.height) - height,
        ),
        detachedBounds.y,
      ),
      width,
      height,
    };
  }

  shapeItem = ({ path, newPosition }) => {
    const { id } = this.props;
    const onRetack = this.props.onRetack || this.context.__bb_shapeItem;

    const newPath = id ? [id, ...path] : path;

    return onRetack({ path: newPath, newPosition });
  }

  createTransformBeginner(child) {
    return (currentTransformType, { relativeCoordinates, mouseCoordinates }) => {
      this.setState(() => ({
        detachedChild: child,
        detachedMouseCoordinates: relativeCoordinates,
        mouseCoordinates,
        currentTransformType,
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
        onBeginTransform: this.createTransformBeginner(child),
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

    const { width, height, y, x } = this.detachedChildPosition(mouseCoordinates);

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
        onMouseUp={this.onMouseUp}
      >
        <div
          style={{
            position: 'absolute',
            top: y,
            left: x,
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
        style={{
          minHeight: this.calculateMinHeight(),
          height: this.calculateHeight(),
        }}
      >
        {this.transformChildren(children)}
        {this.renderDetachedChild()}
      </div>
    );
  }
}
