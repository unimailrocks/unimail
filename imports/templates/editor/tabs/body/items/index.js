import PropTypes from 'prop-types';
import React from 'react';
import { css } from 'aphrodite';
import UnimailPropTypes from '/imports/prop-types';
import colors from '/imports/styles/colors';
import styles from '/imports/styles/functional';

import Container from './container';

export default function Item({ item, path }) {
  switch (item.type) {
    case 'image':
      return (
        <div className={css(styles.fit)} style={{ backgroundColor: colors.grey4 }} />
      );
    case 'container':
      return <Container {...item} path={[...path, item._id]} />;
    default:
      return <div />;
  }
}

Item.propTypes = {
  item: UnimailPropTypes.item.isRequired,
  path: PropTypes.arrayOf(PropTypes.string),
};

Item.defaultProps = {
  path: [],
};
