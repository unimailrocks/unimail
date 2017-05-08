import React, { Component, PropTypes } from 'react';
import Tacked from './tacked';

const { abs, min, max } = Math;

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
      detachedMouseRelativeCoordinates: null,
      currentTransformType: null,
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

  translatingChildPosition({
    mouseCoordinates,
    child,
    relativeCoordinates,
  }) {
    return {
      x: mouseCoordinates.x - relativeCoordinates.x,
      y: mouseCoordinates.y - relativeCoordinates.y,
      width: child.props.width,
      height: child.props.height,
    };
  }

  calculateMouseCorrection(direction) {
    const { width, height } = this.state.detachedChild.props;
    const { x, y } = this.state.detachedMouseRelativeCoordinates;

    switch (direction) {
      case 'l':
        return {
          x: -x,
          y: (height / 2) - y,
        };
      case 'ul':
        return {
          x: -x,
          y: -y,
        };
      case 'u':
        return {
          x: (width / 2) - x,
          y: -y,
        };
      case 'ur':
        return {
          x: width - x,
          y: -y,
        };
      case 'r':
        return {
          x: width - x,
          y: (height / 2) - y,
        };
      case 'dr':
        return {
          x: width - x,
          y: height - y,
        };
      case 'd':
        return {
          x: (width / 2) - x,
          y: height - y,
        };

      case 'dl':
        return {
          x: -x,
          y: height - y,
        };
      default:
        console.warn('got a weird direction...', direction);
        return {
          x: 0,
          y: 0,
        };
    }
  }

  resizingChildPosition({
    direction,
    mouseCoordinates,
    child,
  }) {
    // mouseCorrection is the distance from the point the cursor should be at
    // so if you grab the node 1 pixel to the right and 1 pixel below
    // it will still catch on the node, but the corner should remain
    // at that same difference, which is represented as { x: 1, y: 1 } in this case
    const detachedBounds = this.getCanvasBounds();

    const mouseCorrection = this.calculateMouseCorrection(direction);

    const initial = {
      x: child.props.x + detachedBounds.x,
      y: child.props.y + detachedBounds.y,
      width: child.props.width,
      height: child.props.height,
    };

    const x = direction.includes('l') ?
      mouseCoordinates.x + mouseCorrection.x :
      initial.x;

    const y = direction.includes('u') ?
      mouseCoordinates.y + mouseCorrection.y :
      initial.y;

    let width;
    if (direction.includes('l')) {
      width = (initial.x + initial.width) - x;
    } else if (direction.includes('r')) {
      width = mouseCoordinates.x - x;
    } else {
      width = initial.width;
    }

    let height;
    if (direction.includes('u')) {
      height = (initial.y + initial.height) - y;
    } else if (direction.includes('d')) {
      height = mouseCoordinates.y - y;
    } else {
      height = initial.height;
    }

    return { x, y, width, height };
  }

  boundedPosition({ x, y, width, height }, { resizable = false } = {}) {
    const detachedBounds = this.getCanvasBounds();
    if (resizable) {
      const right = min(x + width, detachedBounds.x + detachedBounds.width);
      const bottom = min(y + height, detachedBounds.y + detachedBounds.height);
      const left = max(x, detachedBounds.x);
      const top = max(y, detachedBounds.y);

      return {
        x: left,
        y: top,
        width: right - left,
        height: bottom - top,
      };
    }

    const boundedX = max(
        min(
          x,
          (detachedBounds.x + detachedBounds.width) - width,
        ),
        detachedBounds.x,
      );

    const boundedY = max(
        min(
          y,
          (detachedBounds.y + detachedBounds.height) - height,
        ),
        detachedBounds.y,
      );

    return {
      x: boundedX,
      y: boundedY,
      width,
      height,
    };
  }

  detachedChildPosition(mouseCoordinates) {
    const {
      detachedChild,
      detachedMouseRelativeCoordinates,
      currentTransformType,
    } = this.state;

    const commonOptions = {
      child: detachedChild,
      relativeCoordinates: detachedMouseRelativeCoordinates,
      mouseCoordinates,
    };

    let ostensiblePosition;
    if (currentTransformType === 'translate') {
      ostensiblePosition = this.translatingChildPosition(commonOptions);
    } else if (currentTransformType.startsWith('resize')) {
      const [, direction] = /resize-(.*)/.exec(currentTransformType);

      ostensiblePosition = this.resizingChildPosition({ ...commonOptions, direction });
    } else {
      throw new Error(`Trying to render detached child with currentTransformType of ${currentTransformType}`);
    }

    const reflectedPosition = {
      x: ostensiblePosition.width < 0 ?
        ostensiblePosition.x + ostensiblePosition.width :
        ostensiblePosition.x,
      y: ostensiblePosition.height < 0 ?
        ostensiblePosition.y + ostensiblePosition.height :
        ostensiblePosition.y,
      width: abs(ostensiblePosition.width),
      height: abs(ostensiblePosition.height),
    };

    const boundedPosition = this.boundedPosition(reflectedPosition, {
      resizable: currentTransformType.startsWith('resize'),
    });
    return boundedPosition;
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
        detachedMouseRelativeCoordinates: relativeCoordinates,
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
    const { width, height, y, x } = this.detachedChildPosition(mouseCoordinates);

    const untacked = React.cloneElement(detachedChild, {
      x: 0,
      y: 0,
      width,
      height,
    });

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
