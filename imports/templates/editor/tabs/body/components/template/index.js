import { initial, merge, capitalize, isEqual } from 'lodash/fp';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { css } from 'aphrodite';

import colors from '/imports/styles/colors';
import functionalStyles from '/imports/styles/functional';

import UnimailPropTypes from '/imports/prop-types';

import { selectItem } from '/imports/templates/editor/duck';

import Frame from './frame';

class Template extends Component {
  static propTypes = {
    // from Redux
    template: UnimailPropTypes.template.isRequired,
    selectItem: PropTypes.func.isRequired,
    locked: PropTypes.bool.isRequired,
    guided: PropTypes.bool.isRequired,
    selectedItemPath: PropTypes.arrayOf(PropTypes.string),

    // from parent
    itemMoved: PropTypes.func.isRequired,
  }

  static defaultProps = {
    selectedItemPath: null,
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

    this.setState({
      moving: {
        path,
        transform: {
          type: 'translate',
          value: { x: 0, y: 0 },
        },
        originalCursorCoordinates: this.getCanvasCoordinates(e),
      },
    });
  }

  beginResize = path => direction => e => {

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
    const { moving } = this.state;
    if (!moving) {
      this.props.selectItem(null);
      return;
    }
    const newMouseCoords = this.getCanvasCoordinates(e);
    const placementOffset = {
      x: newMouseCoords.x - moving.originalCursorCoordinates.x,
      y: newMouseCoords.y - moving.originalCursorCoordinates.y,
    };

    const { placement: initialPlacement } = this.getItemFromPath(moving.path);

    const proposedPlacement = {
      ...initialPlacement,
      x: initialPlacement.x + placementOffset.x,
      y: initialPlacement.y + placementOffset.y,
    };
    const placement = this.correctPlacement({ path: moving.path, proposedPlacement });
    this.setState(state => merge(state, {
      moving: {
        precommittedPlacement: placement,
      },
    }), async () => {
      const { path } = await this.props.itemMoved({
        path: moving.path,
        newPosition: placement,
      });

      this.setState(() => ({ moving: null }));
      this.props.selectItem(path);
    });
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

  renderMovingItem() {
    const { moving: movingData } = this.state;
    const item = this.getItemFromPath(movingData.path);
    const placement = movingData.precommittedPlacement || (() => {
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
        key="moving"
        {...placement}
      >
        {this.renderItem({ item, path: [] })}
      </Frame>
    );
  }

  renderInFrame({ item, path }) {
    if (isEqual((this.state.moving || {}).path, path)) {
      return this.renderMovingItem();
    }

    const isSelected = isEqual(this.props.selectedItemPath, path);

    return (
      <Frame
        onMouseDown={this.onMouseDown(path)}
        key={item._id}
        minimal={!isSelected}
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

function mapStateToProps(state) {
  return {
    template: state.editor.template,
    locked: state.editor.modes.locked,
    guided: state.editor.modes.guided,
    selectedItemPath: state.editor.selectedItemPath,
  };
}

export default connect(mapStateToProps, { selectItem })(Template);
