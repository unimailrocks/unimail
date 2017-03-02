import { Meteor } from 'meteor/meteor';
import cloneDeep from 'lodash/fp/cloneDeep';
import React, { Component } from 'react';
import UnimailPropTypes from '/imports/prop-types';
import StandardInput from '/imports/components/standard-input';

import { consolidateTemplateContent, createTemplateContentDiff } from '/imports/templates/collection';

export default class EditRowForm extends Component {
  static propTypes = {
    template: UnimailPropTypes.template.isRequired,
    row: UnimailPropTypes.row.isRequired,
  };

  changeHeight = async height => {
    const currentRows = consolidateTemplateContent(this.props.template);
    const newRows = currentRows.map(row => {
      if (this.props.row._id !== row._id) {
        return row;
      }

      const newRow = cloneDeep(row);
      newRow.height = parseInt(height, 10);
      return newRow;
    });

    const diff = createTemplateContentDiff(
      currentRows,
      newRows,
    );

    if (!diff) {
      return;
    }

    try {
      await Meteor.callPromise(
        'templates.rows.update-layout',
        this.props.template._id,
        diff,
      );
    } catch (e) {
      console.error('some sort of error resizing?', e);
    }
  };

  render() {
    const { row } = this.props;
    return (
      <StandardInput
        onTrigger={this.changeHeight}
        placeholder="Height"
        buttonText="px tall"
        initialValue={row.height}
      />
    );
  }
}
