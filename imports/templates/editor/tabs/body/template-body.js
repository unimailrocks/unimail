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

function generateItemElement(item) {
  switch (item.type) {
    case 'image':
      return (
        <div key={item._id} style={{ backgroundColor: colors.grey4 }} />
      );
    default:
      return <div />;
  }
}

export default class TemplateBody extends Component {
  static propTypes = {
    template: UnimailPropTypes.template.isRequired,
    onFocusContent: PropTypes.func.isRequired,
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
    return items.map(generateItemElement);
  }

  addElement = ({ type, placement }) => {
    if (type === 'image') {
      Templates.createImage.call({
        templateID: this.props.template._id,
        placement,
      });
    }
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
