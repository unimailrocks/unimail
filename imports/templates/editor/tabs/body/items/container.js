import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { css } from 'aphrodite';

import UnimailPropTypes from '/imports/prop-types';
import styles from '/imports/styles/functional';

import { hoverItem, selectItem } from '/imports/templates/editor/duck';

import BulletinBoard, { Tacked } from '../components/bulletin-board';

import Item from '.';

function Container({
  _id,
  details,
  path,
  guided,
  hoverItem,
  selectItem,
  bulletinBoardProps,
}) {
  const { items } = details;

  const itemElements = items.map(item => (
    <Tacked
      bounded={guided}
      {...item.placement}
      key={item._id}
      onMouseEnter={() => hoverItem([...path, item._id])}
      onMouseLeave={() => hoverItem(null)}
      onInteract={() => selectItem([...path, item._id])}
    >
      <Item item={item} path={path} />
    </Tacked>
  ));

  return (
    <div className={css(styles.fit)}>
      <BulletinBoard
        id={_id}
        {...bulletinBoardProps}
      >
        {itemElements}
      </BulletinBoard>
    </div>
  );
}

Container.propTypes = {
  details: PropTypes.shape({
    items: PropTypes.arrayOf(UnimailPropTypes.item).isRequired,
  }).isRequired,
  _id: PropTypes.string,
  path: PropTypes.arrayOf(PropTypes.string).isRequired,
  guided: PropTypes.bool,
  hoverItem: PropTypes.func.isRequired,
  selectItem: PropTypes.func.isRequired,
  bulletinBoardProps: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

Container.defaultProps = {
  guided: true,
  _id: null,
  bulletinBoardProps: {
    fit: true,
  },
};

function mapStateToProps({ editor: { modes: { guided } } }) {
  return { guided };
}

export default connect(mapStateToProps, { hoverItem, selectItem })(Container);
