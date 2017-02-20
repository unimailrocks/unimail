import { Meteor } from 'meteor/meteor';
import sortBy from 'lodash/fp/sortBy';
import cloneDeep from 'lodash/fp/cloneDeep';
import React, { PropTypes, Component } from 'react';
import { Popup, Button, Segment } from 'semantic-ui-react';
import ReactGridLayout from 'react-grid-layout';

import { consolidateTemplateContent, createTemplateContentDiff } from '/imports/templates/collection';

export default class TemplateBody extends Component {
  static propTypes = {
    template: PropTypes.shape({
      rows: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string.isRequired,

      })).isRequired,
    }).isRequired,
  };

  onLayoutChange = async (newLayout) => {
    // sort the rows by height and trnaslate them to a common layout model
    const rows = sortBy(['y'], newLayout).map(row => ({
      id: row.i,
      height: row.h,
    }));

    // get current rows by consolidating diffs on template to canonical rows
    const currentRows = consolidateTemplateContent(this.props.template);

    // map new row layout to the corresponding row models
    const newRows = rows.map(({ id, height }) => {
      const row = cloneDeep(currentRows.find(({ _id }) => _id === id));
      if (row) {
        // resize row if it needs to be resized
        row.height = height;
        return row;
      }

      return {
        _id: id,
        height: 30,
      };
    });

    // create diff for model
    const diff = createTemplateContentDiff(currentRows, newRows);

    // if there's no difference, skip changing model
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
      console.error('some sort of error?', e);
    }
  };

  addRow = async () => {
    try {
      await Meteor.callPromise('templates.rows.create', this.props.template._id);
    } catch (e) {
      console.error('Couldn\'t add a row?', e);
    }
  };

  renderRows() {
    const rows = consolidateTemplateContent(this.props.template);
    /* eslint-disable no-shadow */
    const { elements } = rows.reduce(({ bottom, elements }, row) => {
    /* eslint-enable no-shadow */
      const rowElement = (
        <div
          style={{
            backgroundColor: '#DDD',
            border: '1px solid black',
          }}
          key={row._id}
          data-grid={{ x: 0, y: bottom, w: 600, h: 40 }}
        >
          {row._id}
        </div>
      );

      return { bottom: bottom + 40, elements: elements.concat([rowElement]) };
    }, { bottom: 0, elements: [] });

    return elements;
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
        <ReactGridLayout
          width={600}
          cols={600}
          onLayoutChange={this.onLayoutChange}
          rowHeight={1}
          margin={[0, 0]}
        >
          {this.renderRows()}
        </ReactGridLayout>
        <Popup
          trigger={
            <Button
              style={{
                position: 'absolute',
                bottom: 0,
                transform: 'translateY(50%)',
                margin: '0 auto',
                left: 0,
                right: 0,
                width: '40px',
                height: '40px',
                padding: 0,
              }}
              circular
              color="green"
              icon="plus"
              onClick={this.addRow}
            />
          }
          content="Add New Row"
          positioning="bottom center"
        />
      </Segment>
    );
  }
}

TemplateBody.propTypes = {
};
