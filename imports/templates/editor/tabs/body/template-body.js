import { Meteor } from 'meteor/meteor';
import sortBy from 'lodash/fp/sortBy';
import cloneDeep from 'lodash/fp/cloneDeep';
import React, { PropTypes, Component } from 'react';
import { Popup, Button, Segment } from 'semantic-ui-react';
import ReactGridLayout from 'react-grid-layout';

import UnimailPropTypes from '/imports/prop-types';
import { consolidateTemplateContent, createTemplateContentDiff } from '/imports/templates/collection';

export default class TemplateBody extends Component {
  static propTypes = {
    template: UnimailPropTypes.template.isRequired,
    onFocusContent: PropTypes.func.isRequired,
  };

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
        <ReactGridLayout
          width={600}
          cols={600}
          onLayoutChange={this.onLayoutChange}
          rowHeight={1}
          margin={[0, 0]}
        />
      </Segment>
    );
  }
}
