import { Meteor } from 'meteor/meteor';
import sortBy from 'lodash/fp/sortBy';
import cloneDeep from 'lodash/fp/cloneDeep';
import React, { PropTypes, Component } from 'react';
import { Popup, Button, Segment } from 'semantic-ui-react';
import ReactGridLayout from 'react-grid-layout';

import UnimailPropTypes from '/imports/prop-types';
import colors from '/imports/styles/colors';
import * as Templates from '/imports/templates/methods';
import { consolidateTemplateContent, createTemplateContentDiff } from '/imports/templates/collection';

import DrawingCanvas from './drawing-canvas';
import Item from './items';

export default class TemplateBody extends Component {
  static propTypes = {
    template: UnimailPropTypes.template.isRequired,
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
      <div key={item._id}>
        <Item item={item} />
      </div>
    ));
  }

  addElement = (item) => {
    Templates.placeItem.call({
      templateID: this.props.template._id,
      item,
    });
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
          <DrawingCanvas onDraw={this.addElement} />
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
