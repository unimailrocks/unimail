import { compact } from 'lodash/fp';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Rail, Segment } from 'semantic-ui-react';

import UnimailPropTypes from '/imports/prop-types';
import { shieldKeys, unshieldKeys } from '/imports/templates/editor/duck';

import ContentForm from './content-form';

function TemplateBodyRightRail({ items, shieldKeys, unshieldKeys }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <Rail
      attached
      position="right"
      onFocus={shieldKeys}
      onBlur={unshieldKeys}
    >
      <Segment raised>
        <Segment.Group>
          {
            items.map(({ path, item }) => (
              <Segment key={item._id}>
                <ContentForm item={item} path={path} />
              </Segment>
            ))
          }
        </Segment.Group>
      </Segment>
    </Rail>
  );
}

TemplateBodyRightRail.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    item: UnimailPropTypes.item.isRequired,
    path: PropTypes.arrayOf(PropTypes.string).isRequired,
  })).isRequired,
  shieldKeys: PropTypes.func.isRequired,
  unshieldKeys: PropTypes.func.isRequired,
};

function mapStateToProps({ editor: { template, selectedItemPaths } }) {
  const items = selectedItemPaths.map(path => {
    const item = path.reduce(({ details: { items } }, id) =>
      items.find(({ _id }) => _id === id),
      { details: template },
    );

    if (!item) {
      return null;
    }

    return {
      item,
      path,
    };
  });

  return { items: compact(items) };
}

export default connect(mapStateToProps, { shieldKeys, unshieldKeys })(TemplateBodyRightRail);
