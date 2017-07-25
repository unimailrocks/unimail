import React from 'react';
import { connect } from 'react-redux';
import { Rail, Segment } from 'semantic-ui-react';

import UnimailPropTypes from '/imports/prop-types';

import ContentForm from './content-form';

function TemplateBodyRightRail({ item }) {
  if (!item) {
    return null;
  }

  return (
    <Rail attached position="right">
      <Segment raised>
        <pre>
          {JSON.stringify(item, null, 2)}
        </pre>
      </Segment>
    </Rail>
  );
}

TemplateBodyRightRail.propTypes = {
  item: UnimailPropTypes.item,
};

TemplateBodyRightRail.defaultProps = {
  item: null,
};

function mapStateToProps({ editor: { template, selectedItemPath } }) {
  if (!selectedItemPath) {
    return {};
  }

  const item = selectedItemPath.reduce(({ details: { items } }, id) =>
    items.find(({ _id }) => _id === id),
    { details: template },
  );

  return { item };
}

export default connect(mapStateToProps)(TemplateBodyRightRail);
