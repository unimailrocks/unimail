import React from 'react';
import { css } from 'aphrodite';
import UnimailPropTypes from '/imports/prop-types';
import colors from '/imports/styles/colors';
import styles from '/imports/styles/functional';

export default function Item({ item }) {
  switch (item.type) {
    case 'image':
      return (
        <div className={css(styles.fit)} style={{ backgroundColor: colors.grey4 }} />
      );
    case 'container':
      return (
        <div className={css(styles.fit)} style={{ border: `1px solid ${colors.grey4}` }} />
      );
    default:
      return <div />;
  }
}

Item.propTypes = {
  item: UnimailPropTypes.item.isRequired,
};
