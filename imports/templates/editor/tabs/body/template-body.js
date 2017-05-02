import React, { Component } from 'react';
import { Segment } from 'semantic-ui-react';
import { connect } from 'react-redux';

import UnimailPropTypes from '/imports/prop-types';
import * as Templates from '/imports/templates/methods';

import DrawingCanvas from './components/drawing-canvas';
import BulletinBoard, { Tacked } from './components/bulletin-board';
import Item from './items';

class TemplateBody extends Component {
  static propTypes = {
    template: UnimailPropTypes.template.isRequired,
    tool: UnimailPropTypes.tool,
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
        <div style={{ position: 'relative' }}>
          <DrawingCanvas onDraw={this.addElement} testDraw={this.testDraw} />
          <BulletinBoard
            widthLocked
            minHeight={300}
            onRetack={this.itemMoved}
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
  };
}

export default connect(mapStateToProps)(TemplateBody);
