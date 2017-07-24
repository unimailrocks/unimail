import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Segment } from 'semantic-ui-react';
import { connect } from 'react-redux';

import UnimailPropTypes from '/imports/prop-types';
import * as Templates from '/imports/templates/methods';

import KeyListener from '/imports/components/key-listener';
import {
  enterGuidedMode,
  enterUnguidedMode,
  enterLockedMode,
  enterUnlockedMode,
} from '../../duck';

import DrawingCanvas from './components/drawing-canvas';
import BulletinBoard, { Tacked } from './components/bulletin-board';
import Item from './items';

class TemplateBody extends Component {
  static propTypes = {
    template: UnimailPropTypes.template.isRequired,
    tool: UnimailPropTypes.tool,
    enterGuidedMode: PropTypes.func.isRequired,
    enterUnguidedMode: PropTypes.func.isRequired,
    enterLockedMode: PropTypes.func.isRequired,
    enterUnlockedMode: PropTypes.func.isRequired,
    locked: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    tool: null,
  }

  itemMoved = async ({ path, newPosition }) => {
    const { _id: templateID } = this.props.template;
    try {
      await Templates.Items.moveItem.callPromise({
        templateID,
        placement: newPosition,
        path,
      });
    } catch (err) {
      console.error('>.< some error', err);
    }
  };

  generateDOM() {
    const { items } = this.props.template;
    return items.map(item => (
      <Tacked
        key={item._id}
        {...item.placement}
      >
        <Item item={item} />
      </Tacked>
    ));
  }

  addElement = async (item) => {
    try {
      await Templates.Items.placeItem.callPromise({
        templateID: this.props.template._id,
        item,
      });
    } catch (e) {
      console.error(e.error);
    }
  }

  testDraw = rect => {
    const { tool } = this.props;
    const placed = Templates.Items.calculateItemPlacement(rect, this.props.template.items, {
      outerPossible: tool === 'draw-container',
    });

    return !!placed;
  }

  render() {
    return (
      <Segment
        raised
        style={{
          width: '600px',
          margin: '0 auto',
          padding: 0,
        }}
      >
        <KeyListener
          onShiftDown={this.props.enterUnguidedMode}
          onShiftUp={this.props.enterGuidedMode}
          onControlDown={this.props.enterLockedMode}
          onControlUp={this.props.enterUnlockedMode}
        />
        <div style={{ position: 'relative' }}>
          <DrawingCanvas onDraw={this.addElement} testDraw={this.testDraw} />
          <BulletinBoard
            widthLocked
            minHeight={300}
            onRetack={this.itemMoved}
            locked={this.props.locked}
          >
            {this.generateDOM()}
          </BulletinBoard>
        </div>
      </Segment>
    );
  }
}

function mapStateToProps(state) {
  return {
    tool: state.editor.tool,
    locked: state.editor.modes.locked,
  };
}

export default connect(mapStateToProps, {
  enterGuidedMode,
  enterUnguidedMode,
  enterUnlockedMode,
  enterLockedMode,
})(TemplateBody);
