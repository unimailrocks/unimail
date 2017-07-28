import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Rail, Segment } from 'semantic-ui-react';

import UnimailPropTypes from '/imports/prop-types';

import ContentForm from './content-form';

function TemplateBodyRightRail({ items }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <Rail attached position="right">
      <Segment raised>
        <pre>
          {JSON.stringify(items, null, 2)}
        </pre>
      </Segment>
    </Rail>
  );
}

TemplateBodyRightRail.propTypes = {
  items: PropTypes.arrayOf(UnimailPropTypes.item).isRequired,
};

function mapStateToProps({ editor: { template, selectedItemPaths } }) {
  const items = selectedItemPaths.map(path =>
    path.reduce(({ details: { items } }, id) =>
      items.find(({ _id }) => _id === id),
      { details: template },
    ));

  return { items };
}

export default connect(mapStateToProps)(TemplateBodyRightRail);
