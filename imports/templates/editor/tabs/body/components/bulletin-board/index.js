import PropTypes from 'prop-types';
/* eslint-disable react/sort-comp */
import React, { Component } from 'react';
import Tacked from './tacked';

const { abs, min, max } = Math;

export { Tacked };

export default class BulletinBoard extends Component {
  static propTypes = {
    className: PropTypes.string,
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
    __bb_registerResizeResponder: PropTypes.func,
    __bb_contextID: PropTypes.string,
  };

  static contextTypes = {
    __bb_shapeItem: PropTypes.func,
    __bb_registerResizeResponder: PropTypes.func,
    __bb_translation: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }),
    __bb_contextID: PropTypes.string,
  };

  state = {
    detachedChildKey: null,
  };

  resizeResponders = {};

  componentWillReceiveProps(newProps, nextContext) {
    if (!newProps.onRetack && !nextContext.__bb_shapeItem) {
      throw new Error('Base BulletinBoard must have `onRetack` prop!');
    }
    const newContextID = nextContext.__bb_contextID;
    if (newContextID) {
      this.context.__bb_registerResizeResponder(newContextID, this.respondToResize);
    }
  }

  componentWillUpdate(newProps, newState) {
    this.detachedChild = this.getDetachedChild(newProps, newState.detachedChildKey);
  }

  componentDidMount() {
    if (this.context.__bb_registerResizeResponder) {
      this.context.__bb_registerResizeResponder(this.context.__bb_contextID, this.respondToResize);
    }
  }

  getChildContext() {
    return {
      __bb_shapeItem: this.shapeItem,
      __bb_registerResizeResponder: this.registerSubboardShrinkwrapper,
    };
  }

  onMouseMove = e => {
    if (!this.detachedChild) {
      return;
    }

    const mouseCoordinates = { x: e.clientX, y: e.clientY };
    this.setState(() => ({
      mouseCoordinates,
    }));
  }

  onMouseUp = async e => {
    const { detachedChild } = this;
    const mouseCoordinates = { x: e.clientX, y: e.clientY };

    const path = [detachedChild.key];

    const { position: fixedPosition, changes = [] } = this.detachedChildPosition(mouseCoordinates);
    const newPosition = this.translateToCanvas(fixedPosition);
    const ancestorUpdates = Promise.all(
      changes.map(this.shapeItem),
    );

    // make all changes necessary
    // pass them up or out (to context or to props)
    await Promise.all([
      this.shapeItem({
        path,
        newPosition,
      }),
      ancestorUpdates,
    ]);

    this.setState(() => ({
      detachedChildKey: null,
      detachedMouseRelativeCoordinates: null,
      currentTransformType: null,
    }));
  };

  getDetachedChild(props, key) {
    if (!key) {
      return null;
    }

    let detachedChild = null;
    React.Children.forEach(this.props.children, child => {
      if (child.key === key) {
        detachedChild = child;
      }
    });

    return detachedChild;
  }

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

    const minPx = max(...bottoms, minHeight);
    return `${minPx}px`;
  }

  calculateHeight() {
    const { fit } = this.props;
    if (fit) {
      return '100%';
    }

    return null;
  }

  static translatingChildPosition({
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
    const detachedChild = this.detachedChild;
    const { width, height } = detachedChild.props;
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

  registerSubboardShrinkwrapper = (contextID, resizeResponder) => {
    this.resizeResponders[contextID] = resizeResponder;
  }

  boundedPosition(position, { resizable = false } = {}) {
    const { x, y, width, height } = position;
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

  translateToCanvas(absolutePosition) {
    const bounds = this.getCanvasBounds();
    return {
      ...absolutePosition,
      x: absolutePosition.x - bounds.x,
      y: absolutePosition.y - bounds.y,
    };
  }

  /*
   * Returns an object
     {
       // the canvas position,
       // making sure we don't collide with successor elements
       position: { x, y, width, height },

       // the changes in x and y from their suspected position
       diff: { x, y },

       // arguments to pass to shapeItem
       // (reflect changes to successor items)
       changes: [{ newPosition, path }]
     }
   */
  shrinkWrappedPosition(absolutePosition, id) {
    // descendant component's respondToResize
    const responder = this.resizeResponders[id];
    if (!responder) {
      // there is no billboard inside the detached child
      return {
        position: absolutePosition,
        diff: { x: 0, y: 0 },
        changes: [],
      };
    }

    const detachedChild = this.detachedChild;
    const { x, y } = detachedChild.props;
    const canvasPosition = this.translateToCanvas(absolutePosition);
    const ostensibleDiff = {
      x: canvasPosition.x - x,
      y: canvasPosition.y - y,
    };

    const ostensibleDims = {
      width: canvasPosition.width,
      height: canvasPosition.height,
    };

    const { dims, diff, changes } = responder(ostensibleDiff, ostensibleDims);

    const position = {
      // unapply old diff, apply new diff
      x: absolutePosition.x - ostensibleDiff.x + diff.x, // eslint-disable-line no-mixed-operators
      y: absolutePosition.y - ostensibleDiff.y + diff.y, // eslint-disable-line no-mixed-operators
      width: dims.width,
      height: dims.height,
    };

    return { position, diff, changes };
  }

  // just communicates with parent's shrinkWrappedPosition
  // about current BulletinBoard's needs
  respondToResize = (ostensibleDiff, ostensibleDims) => {
    // these define the smallest rectangle that a rectangle
    // containing all of the children would have to
    const thresholds = {
      top: Infinity,
      bottom: 0,
      left: Infinity,
      right: 0,
    };

    const { children } = this.props;
    if (children.length === 0) {
      return { diff: ostensibleDiff, dims: ostensibleDims, changes: [] };
    }

    React.Children.forEach(children, ({ props: { x, y, width, height } }) => {
      if (thresholds.top > y) {
        thresholds.top = y;
      }

      if (thresholds.bottom < y + height) {
        thresholds.bottom = y + height;
      }

      if (thresholds.left > x) {
        thresholds.left = x;
      }

      if (thresholds.right < x + width) {
        thresholds.right = x + width;
      }
    });

    // the corrected diff
    const newDiff = {
      // force corner to not infringe from the top
      // or the left
      x: min(thresholds.left, ostensibleDiff.x),
      y: min(thresholds.top, ostensibleDiff.y),
    };

    const newDims = {
      width: max(
        // in the case that the left gets corrected
        // we increase the width as much as the expected width
        ostensibleDims.width + (ostensibleDiff.x - newDiff.x),
        // but make sure it's big enough to not infringe
        // on the right
        thresholds.right - newDiff.x,
      ),
      // likeewise for height
      height: max(
        ostensibleDims.height + (ostensibleDiff.y - newDiff.y),
        thresholds.bottom - newDiff.y,
      ),
    };

    const myKey = this.props.id ? [this.props.id] : [];
    const changes = React.Children.map(children, child => ({
      path: [...myKey, child.key],
      newPosition: {
        x: child.props.x - newDiff.x,
        y: child.props.y - newDiff.y,
        width: child.props.width,
        height: child.props.height,
      },
    }));

    return { diff: newDiff, dims: newDims, changes };
  }

  detachedChildPosition(mouseCoordinates) {
    const { detachedChild } = this;
    const {
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
      ostensiblePosition = this.constructor.translatingChildPosition(commonOptions);
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

    const isResizing = currentTransformType.startsWith('resize');

    const boundedPosition = detachedChild.props.bounded ?
      this.boundedPosition(reflectedPosition, {
        resizable: isResizing,
      }) : reflectedPosition;

    if (isResizing) {
      const { position: shrinkWrappedPosition, diff, changes } =
        this.shrinkWrappedPosition(boundedPosition, detachedChild.key);

      return { position: shrinkWrappedPosition, diff, changes };
    }

    return {
      position: boundedPosition,
    };
  }

  // if it's our child that's being resized, call with [child.key] as path
  // otherwise, this is called by child BulletinBoard shaping a successor's item
  // pass out of the component to props.onRetack
  // if that prop doesn't exist, call up to ancestor BulletinBoard
  shapeItem = ({ path, newPosition }) => {
    const { id } = this.props;
    const onRetack = this.props.onRetack || this.context.__bb_shapeItem;

    const newPath = id ? [id, ...path] : path;

    return onRetack({ path: newPath, newPosition });
  }

  // For when a Tacked tells a BulletinBoard we're starting some kind of motion
  createTransformBeginner(child) {
    return (currentTransformType, { relativeCoordinates, mouseCoordinates }) => {
      this.setState(() => ({
        detachedChildKey: child.key,
        detachedMouseRelativeCoordinates: relativeCoordinates,
        mouseCoordinates,
        currentTransformType,
      }));
    };
  }

  getInnerTranslation() {
    return this.context.__bb_translation || { x: 0, y: 0 };
  }

  // transform the children that will be rendered
  transformChildren(children) {
    const { detachedChild } = this;
    const translation = this.getInnerTranslation();
    return React.Children.map(children, child => {
      if (detachedChild && child.key === detachedChild.key) {
        return null;
      }

      return React.cloneElement(child, {
        onBeginTransform: this.createTransformBeginner(child),
        id: child.key,
        x: child.props.x - translation.x,
        y: child.props.y - translation.y,
      });
    });
  }

  registerContainer = container => {
    this.container = container;
  };

  renderDetachedChild() {
    const { mouseCoordinates } = this.state;
    const { detachedChild } = this;
    if (!detachedChild) {
      return null;
    }
    const { position, diff = { x: 0, y: 0 } } = this.detachedChildPosition(mouseCoordinates);
    const { width, height, y, x } = position;

    const untacked = React.cloneElement(detachedChild, {
      x: 0,
      y: 0,
      width,
      height,
      id: detachedChild.key,
      // indirectly sets context.__bb_translation
      ancestorTranslation: diff,
    });

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          left: 0,
          bottom: 0,
          zIndex: 10,
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
