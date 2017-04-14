import React, { PropTypes } from 'react';
import { css } from 'aphrodite';
import UnimailPropTypes from '/imports/prop-types';
import colors from '/imports/styles/colors';
import styles from '/imports/styles/functional';

import Container from './container';

export default function Item({ item, depth }) {
  switch (item.type) {
    case 'image':
      return (
        <div className={css(styles.fit)} style={{ backgroundColor: colors.grey4 }} />
      );
    case 'container':
      return <Container {...item} depth={depth} />;
    default:
      return <div />;
  }
}

Item.propTypes = {
  item: UnimailPropTypes.item.isRequired,
  depth: PropTypes.number,
};

Item.defaultProps = {
  depth: 0,
};
