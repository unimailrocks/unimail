import { Meteor } from 'meteor/meteor';
import sortBy from 'lodash/fp/sortBy';
import cloneDeep from 'lodash/fp/cloneDeep';
import React, { PropTypes, Component } from 'react';
import { Popup, Button, Segment } from 'semantic-ui-react';
import ReactGridLayout from 'react-grid-layout';
import { connect } from 'react-redux';

import UnimailPropTypes from '/imports/prop-types';
import colors from '/imports/styles/colors';
import * as Templates from '/imports/templates/methods';
import { calculateItemPlacement } from '/imports/templates/methods/items';
import { consolidateTemplateContent, createTemplateContentDiff } from '/imports/templates/collection';

import DrawingCanvas from './drawing-canvas';
import Item from './items';

class TemplateBody extends Component {
  static propTypes = {
    template: UnimailPropTypes.template.isRequired,
    tool: UnimailPropTypes.tool,
  };

  static defaultProps = {
    tool: null,
  }

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
      <div key={item._id}>
        <Item item={item} />
      </div>
    ));
  }

  addElement = async (item) => {
    try {
      await Templates.placeItem.callPromise({
        templateID: this.props.template._id,
        item,
      });
    } catch (e) {
      console.error(e.error);
    }
  }

  testDraw = rect => {
    const { tool } = this.props;
    const placed = calculateItemPlacement(rect, this.props.template.items, {
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
          <ReactGridLayout
            width={600}
            cols={600}
            onLayoutChange={this.onLayoutChange}
            rowHeight={1}
            margin={[0, 0]}
            style={{
              minHeight: '300px',
            }}
            verticalCompact={false}
            layout={this.generateLayout()}
          >
            {this.generateDOM()}
          </ReactGridLayout>
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
