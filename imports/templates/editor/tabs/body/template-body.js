import { Meteor } from 'meteor/meteor';
import sortBy from 'lodash/fp/sortBy';
import cloneDeep from 'lodash/fp/cloneDeep';
import React, { PropTypes, Component } from 'react';
import { Popup, Button, Segment } from 'semantic-ui-react';
import ReactGridLayout from 'react-grid-layout';

import UnimailPropTypes from '/imports/prop-types';
import { consolidateTemplateContent, createTemplateContentDiff } from '/imports/templates/collection';

import DrawingCanvas from './drawing-canvas';

export default class TemplateBody extends Component {
  static propTypes = {
    template: UnimailPropTypes.template.isRequired,
    onFocusContent: PropTypes.func.isRequired,
  };

  generateLayout() {
    return [

    ];
  }

  addElement = ({ type, placement }) => {
    console.log('adding a', type, 'at', placement);
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
          />
        </div>
      </Segment>
    );
  }
}
