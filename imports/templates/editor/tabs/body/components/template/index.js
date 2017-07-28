import {
  get,
  last,
  find,
  initial,
  merge,
  capitalize,
  isEqual,
  take,
  reject,
} from 'lodash/fp';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { css } from 'aphrodite';

import colors from '/imports/styles/colors';
import functionalStyles from '/imports/styles/functional';

import UnimailPropTypes from '/imports/prop-types';

import { items } from '/imports/templates/editor/duck';

import Frame from './frame';

class Template extends Component {
  static propTypes = {
    // from Redux
    template: UnimailPropTypes.template.isRequired,
    selectItem: PropTypes.func.isRequired,
    unselectItem: PropTypes.func.isRequired,
    unselectAllItems: PropTypes.func.isRequired,
    locked: PropTypes.bool.isRequired,
    guided: PropTypes.bool.isRequired,
    selectedItemPaths: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
    movingPaths: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,

    // from parent
    itemMoved: PropTypes.func.isRequired,
  }

  state = {
    // a description of the item that is currently being moved or resized
    moving: null,
  }

  onMouseDown = path => e => {
    if (e.button !== 0 || this.props.locked) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    this.props.selectItem(path);
    this.mouseDownTime = new Date();
    this.mouseDownPath = path;

    this.setState({
      moving: {
        transform: {
          type: 'translate',
          value: { x: 0, y: 0 },
        },
        originalCursorCoordinates: this.getCanvasCoordinates(e),
      },
    });
  }

  onMouseMove = e => {
    if (!this.state.moving) {
      return;
    }

    const newCoords = this.getCanvasCoordinates(e);
    this.setState(state => merge(state, {
      moving: {
        transform: {
          value: {
            x: newCoords.x - state.moving.originalCursorCoordinates.x,
            y: newCoords.y - state.moving.originalCursorCoordinates.y,
          },
        },
      },
    }));
  }

  onMouseUp = async e => {
    // if it's just a quick click, user is probably just trying to select it
    const timeDifference = new Date() - this.mouseDownTime;

    const { moving } = this.state;
    if (!moving) {
      this.props.unselectAllItems();
      return;
    }
    const newMouseCoords = this.getCanvasCoordinates(e);
    const placementOffset = {
      x: newMouseCoords.x - moving.originalCursorCoordinates.x,
      y: newMouseCoords.y - moving.originalCursorCoordinates.y,
    };

    const distance = (placementOffset.x ** 2) + (placementOffset.y ** 2);

    // if the move was insignficant both time-wise and distance-wise,
    // user was probably just trying to select only the item
    if (distance < 50 && timeDifference < 500 && this.mouseDownPath) {
      this.props.unselectAllItems();
      this.props.selectItem(this.mouseDownPath);

      this.mouseDownPath = null;
      this.mouseDownTime = null;

      this.setState(() => ({ moving: null }));
      return;
    }

    this.props.movingPaths.forEach(path => {
      const { placement: initialPlacement } = this.getItemFromPath(path);

      const proposedPlacement = {
        ...initialPlacement,
        x: initialPlacement.x + placementOffset.x,
        y: initialPlacement.y + placementOffset.y,
      };

      const placement = this.correctPlacement({ path, proposedPlacement });
      this.setState(state => merge(state, {
        moving: {
          precommittedPlacements: {
            [last(path)]: placement,
          },
        },
      }), async () => {
        const { path: newPath } = await this.props.itemMoved({
          path,
          newPosition: placement,
        });

        this.setState(() => ({ moving: null }));
        this.props.unselectItem(path);
        this.props.selectItem(newPath);
      });
    });
  }

  getCanvasCoordinates(event) {
    const boundingRect = this.canvas.getBoundingClientRect();

    return {
      x: event.clientX - boundingRect.left,
      y: event.clientY - boundingRect.top,
    };
  }

  getItemFromPath(path) {
    const currentPath = [...path];
    let item = { details: this.props.template };
    do {
      const id = currentPath.shift();
      item = item.details.items.find(({ _id }) => _id === id);
    } while (currentPath.length > 0);

    return item;
  }

  correctPlacement({ path, proposedPlacement }) {
    const parentPath = initial(path);
    const placement = { ...proposedPlacement };
    // bind to parent
    if (this.props.guided && parentPath.length > 0) {
      const parent = this.getItemFromPath(parentPath);
      if (placement.x < 0) {
        placement.x = 0;
      } else if (placement.x + placement.width > parent.placement.width) {
        const diff = (placement.x + placement.width) - parent.placement.width;
        placement.x -= diff;
      }

      if (placement.y < 0) {
        placement.y = 0;
      } else if (placement.y + placement.height > parent.placement.height) {
        const diff = (placement.y + placement.height) - parent.placement.height;
        placement.y -= diff;
      }
    }

    return placement;
  }


  calculateMinHeight() {
    const { template } = this.props;
    const bottoms = template.items.map(i => i.placement.y + i.placement.height);
    const minPx = Math.max(...bottoms) + 300;
    return `${minPx}px`;
  }

  renderImage({ path }) {
    return (
      <div
        className={css(functionalStyles.fit)}
        style={{ backgroundColor: colors.grey4.string() }}
      >
        {path.map(([c]) => c).toString()}
      </div>
    );
  }

  renderContainer({ item, path }) {
    return (
      <div>
        {this.renderItems({ items: item.details.items, path })}
      </div>
    );
  }

  renderItem(arg) {
    const renderMethodName = `render${capitalize(arg.item.type)}`;
    return this[renderMethodName](arg);
  }

  renderMovingItem(item) {
    const { moving: movingData } = this.state;
    const placement = get(item._id, movingData.precommittedPlacements) || (() => {
      const { value: placementOffset } = movingData.transform;
      const { placement: initialPlacement } = item;

      const proposedPlacement = {
        ...initialPlacement,
        x: initialPlacement.x + placementOffset.x,
        y: initialPlacement.y + placementOffset.y,
      };

      return this.correctPlacement({ path: movingData.path, proposedPlacement });
    })();

    return (
      <Frame
        key={item._id}
        style={{
          cursor: this.props.locked ? 'default' : 'move',
        }}
        {...placement}
      >
        {this.renderItem({ item, path: [] })}
      </Frame>
    );
  }

  renderInFrame({ item, path }) {
    const { selectedItemPaths } = this.props;
    const { moving } = this.state;
    const isSelected = find(isEqual(path))(selectedItemPaths);
    if (isSelected && moving) {
      return this.renderMovingItem(item);
    }

    return (
      <Frame
        onMouseDown={this.onMouseDown(path)}
        key={item._id}
        minimal={!isSelected}
        style={{
          cursor: this.props.locked ? 'default' : 'move',
        }}
        {...item.placement}
      >
        {this.renderItem({ item, path })}
      </Frame>
    );
  }

  renderItems({ items, path = [] }) {
    return items.map(item => this.renderInFrame({ item, path: [...path, item._id] }));
  }

  render() {
    const { template } = this.props;

    return (
      <div>
        <div
          ref={canvas => { this.canvas = canvas; }}
          onMouseMove={this.onMouseMove}
          onMouseUp={this.onMouseUp}
          style={{
            minHeight: this.calculateMinHeight(),
          }}
        >
          {this.renderItems(template)}
        </div>
      </div>
    );
  }
}

// a lot of stuff internal to the component should be memoized
// I think this is better done by reselect than in the component
// but it's just a preference, and reselect is already written
// whereas we'd pretty much have to roll our own memoization integration
// if we did it in the component
const getSelectedPaths = get(['editor', 'selectedItemPaths']);
const getMovingPaths = createSelector(
  [getSelectedPaths],
  paths => reject(consideredPath => find(possibleParent => {
    if (possibleParent.length >= consideredPath.length) {
      return false;
    }

    const precursor = take(possibleParent.length, consideredPath);
    return isEqual(precursor, possibleParent);
  })(paths))(paths),
);

function mapStateToProps(state) {
  return {
    template: state.editor.template,
    locked: state.editor.modes.locked,
    guided: state.editor.modes.guided,
    selectedItemPaths: state.editor.selectedItemPaths,
    movingPaths: getMovingPaths(state),
  };
}

export default connect(mapStateToProps, {
  selectItem: items.select,
  unselectItem: items.unselect,
  unselectAllItems: items.unselectAll,
})(Template);
