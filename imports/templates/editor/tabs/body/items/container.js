import { isEqual } from 'lodash/fp';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';

import UnimailPropTypes from '/imports/prop-types';
import functionalStyles from '/imports/styles/functional';
import colors from '/imports/styles/colors';

import { hoverItem, selectItem } from '/imports/templates/editor/duck';

import BulletinBoard, { Tacked } from '../components/bulletin-board';

import Item from '.';

const styles = StyleSheet.create({
  faintOutline: {
    border: `1px solid ${colors.black.alpha(0.3).toString()}`,
    boxShadow: `0 0 1px ${colors.white.alpha(0.3).toString()}`,
  },
});

function Container({
  _id,
  details,
  path,
  guided,
  hoverItem,
  selectItem,
  bulletinBoardProps,
  selectedItemPath,
}) {
  const { items } = details;

  const itemElements = items.map(item => {
    const fullPath = [...path, item._id];
    const selected = isEqual(fullPath, selectedItemPath);

    return {
      bounded: guided,
      ...item.placement,
      onMouseEnter() { hoverItem(fullPath); },
      onMouseLeave() { hoverItem(null); },
      onInteract() { selectItem(fullPath); },
      showFrame: selected,
      className: css(!selected && styles.faintOutline),
      child: <Item item={item} path={path} />,
      key: item._id,
    };
  });

  return (
    <div className={css(functionalStyles.fit)}>
      <BulletinBoard
        id={_id}
        {...bulletinBoardProps}
        elements={itemElements}
      />
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
  selectedItemPath: PropTypes.arrayOf(PropTypes.string),
};

Container.defaultProps = {
  guided: true,
  _id: null,
  bulletinBoardProps: {
    fit: true,
  },
  selectedItemPath: null,
};

function mapStateToProps({ editor: { selectedItemPath, modes: { guided } } }) {
  return { guided, selectedItemPath };
}

export default connect(mapStateToProps, { hoverItem, selectItem })(Container);
