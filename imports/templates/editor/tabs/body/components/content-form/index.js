import React from 'react';
import PropTypes from 'prop-types';
import Inspector from 'react-inspector';
import UnimailPropTypes from '/imports/prop-types';
import ContainerForm from './container';

export default function ContentForm({ item, path }) {
  switch (item.type) {
    case 'container':
      return <ContainerForm item={item} path={path} />;
    default:
      return <Inspector data={item} />;
  }
}

ContentForm.propTypes = {
  item: UnimailPropTypes.item.isRequired,
  path: PropTypes.arrayOf(PropTypes.string).isRequired,
};
