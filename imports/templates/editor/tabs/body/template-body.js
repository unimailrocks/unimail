import find from 'lodash/fp/find';
import isMatch from 'lodash/fp/isMatch';
import React, { Component } from 'react';
import { Segment } from 'semantic-ui-react';
import ReactGridLayout from 'react-grid-layout';
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

  onLayoutChange = async newLayout => {
    const { items, _id: templateID } = this.props.template;
    const results = await Promise.all(newLayout.map(async layoutItem => {
      const relatedItem = find({ _id: layoutItem.i }, items);
      const itemDimensions = {
        width: layoutItem.w,
        height: layoutItem.h,
        x: layoutItem.x,
        y: layoutItem.y,
      };

      if (isMatch(itemDimensions, relatedItem.placement)) {
        return false;
      }

      try {
        await Templates.Items.moveItem.callPromise({
          templateID,
          placement: itemDimensions,
          path: [relatedItem._id],
        });
      } catch (err) {
        console.error('>.< some error', err);
      }

      return true;
    }));

    // if any of them need a re-layout
    // then reset the layout
    if (results.reduce((a, b) => a || b, false)) {
      this.resetLayout();
    }
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

  generateLayout() {
    const { items } = this.props.template;
    return items.map(({ _id, placement }) => ({
      x: placement.x,
      y: placement.y,
      w: placement.width,
      h: placement.height,
      i: _id,
    }));
  }

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

  resetLayout() {
    this._shouldReverseLayout = !this._shouldReverseLayout;
    this.forceUpdate();
  }

  render() {
    const layout = this.generateLayout();
    // reverse layout if we're trying to force a re-layout
    // works because ids still match up with keys but
    // array is not _.isEqual (which is used internally)
    // in ReactGridLayout
    if (this._shouldReverseLayout) {
      layout.reverse();
    }
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
          {/* <ReactGridLayout
            width={600}
            cols={600}
            onLayoutChange={this.onLayoutChange}
            rowHeight={1}
            margin={[0, 0]}
            style={{
              minHeight: '300px',
            }}
            verticalCompact={false}
            layout={layout}
          >
            {this.generateDOM()}
          </ReactGridLayout>*/}
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
