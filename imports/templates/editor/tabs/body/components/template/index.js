import { merge, capitalize, isEqual } from 'lodash/fp';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { css } from 'aphrodite';

import colors from '/imports/styles/colors';
import functionalStyles from '/imports/styles/functional';
import { relativeClickCoordinates } from '/imports/utils/dom';

import UnimailPropTypes from '/imports/prop-types';

import { selectItem } from '/imports/templates/editor/duck';

function Frame({
  children,
  x,
  y,
  height,
  width,
  style,
  ...divProps
}) {
  return (
    <div
      style={{
        height,
        width,
        left: x,
        top: y,
        position: 'absolute',
        border: '1px solid black',
        boxSizing: 'border-box',
        ...style,
      }}
      {...divProps}
    >
      {children}
    </div>
  );
}

class Template extends Component {
  static propTypes = {
    // from Redux
    template: UnimailPropTypes.template.isRequired,
    selectItem: PropTypes.func.isRequired,
    locked: PropTypes.bool.isRequired,

    // from parent
    itemMoved: PropTypes.func.isRequired,
  }

  state = {
    // a description of the item that is currently being moved or resized
    moving: null,
  }

  onMouseDown = path => e => {
    console.log('huh...', e.button, this.props);
    if (e.button !== 0 || this.props.locked) {
      console.log('zoom zoom zoom');
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
    const newMouseCoords = this.getCanvasCoordinates(e);
    const placementOffset = {
      x: newMouseCoords.x - moving.originalCursorCoordinates.x,
      y: newMouseCoords.y - moving.originalCursorCoordinates.y,
    };

    const { placement } = this.getItemFromPath(moving.path);

    const { path } = await this.props.itemMoved({
      path: moving.path,
      newPosition: {
        ...placement,
        x: placement.x + placementOffset.x,
        y: placement.y + placementOffset.y,
      },
    });

    this.setState(() => ({ moving: null }));
    this.props.selectItem(path);
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

  renderImage({ item, path }) {
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
    const { value: placementOffset } = movingData.transform;
    const item = this.getItemFromPath(movingData.path);
    const { placement } = item;

    return (
      <Frame
        key="moving"
        {...placement}
        x={placement.x + placementOffset.x}
        y={placement.y + placementOffset.y}
      >
        {this.renderItem({ item, path: [] })}
      </Frame>
    );
  }

  renderInFrame({ item, path }) {
    if (isEqual((this.state.moving || {}).path, path)) {
      return this.renderMovingItem();
    }

    return (
      <Frame
        onMouseDown={this.onMouseDown(path)}
        key={item._id}
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
          ref={canvas => this.canvas = canvas}
          onMouseMove={this.onMouseMove}
          onMouseUp={this.onMouseUp}
          style={{
            minHeight: this.calculateMinHeight(),
          }}
        >
          {this.renderItems(template)}
        </div>

        <hr />
        <pre>
          {JSON.stringify(template, null, 2)}
        </pre>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    template: state.editor.template,
    locked: state.editor.modes.locked,
  };
}

export default connect(mapStateToProps, { selectItem })(Template);
