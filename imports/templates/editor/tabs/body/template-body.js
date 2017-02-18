import { Meteor } from 'meteor/meteor';
import React, { PropTypes, Component } from 'react';
import { Popup, Button, Segment } from 'semantic-ui-react';
import ReactGridLayout from 'react-grid-layout';

import { consolidateTemplateContent } from '/imports/templates/collection';

export default class TemplateBody extends Component {

  static propTypes = {
    template: PropTypes.shape({
      rows: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string.isRequired,

      })).isRequired,
    }).isRequired,
  };

  onLayoutChange = (newLayout) => {
    console.log('new layout!', newLayout);
  };

  onDragStart = (layout, oldItem, newItem, placeholder) => {
    console.log({ layout, oldItem, newItem, placeholder });
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
            backgroundColor: '#A4A4A4',
            border: '1px solid black',
          }}
          key={row._id}
          data-grid={{ x: 0, y: bottom, w: 600, h: 40 }}
        />
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
          columns={600}
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
