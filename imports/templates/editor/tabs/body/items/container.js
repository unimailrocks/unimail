import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { css } from 'aphrodite';

import UnimailPropTypes from '/imports/prop-types';
import styles from '/imports/styles/functional';

import BulletinBoard, { Tacked } from '../components/bulletin-board';

import Item from '.';

function Container({ _id, details, path, guided }) {
  const { items } = details;

  const itemElements = items.map(item => (
    <Tacked
      bounded={guided}
      {...item.placement}
      key={item._id}
    >
      <Item item={item} path={path} />
    </Tacked>
  ));

  return (
    <div className={css(styles.fit)}>
      <BulletinBoard id={_id} fit>
        {itemElements}
      </BulletinBoard>
    </div>
  );
}

Container.propTypes = {
  details: PropTypes.shape({
    items: PropTypes.arrayOf(UnimailPropTypes.item).isRequired,
  }).isRequired,
  _id: PropTypes.string.isRequired,
  path: PropTypes.arrayOf(PropTypes.string).isRequired,
  guided: PropTypes.bool,
};

Container.defaultProps = {
  guided: true,
};

function mapStateToProps({ editor: { modes: { guided } } }) {
  return { guided };
}

export default connect(mapStateToProps)(Container);
