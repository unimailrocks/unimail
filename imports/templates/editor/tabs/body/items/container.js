import React, { Component, PropTypes } from 'react';
import isMatch from 'lodash/fp/isMatch';
import find from 'lodash/fp/find';
import { StyleSheet, css } from 'aphrodite';
import { connect } from 'react-redux';
import ReactGridLayout from 'react-grid-layout';

import * as Templates from '/imports/templates/methods';

import UnimailPropTypes from '/imports/prop-types';
import colors from '/imports/styles/colors';
import styles from '/imports/styles/functional';

import BulletinBoard, { Tacked } from '../components/bulletin-board';

import Item from '.';

const containerStyles = StyleSheet.create({
  bordered: {
    border: `1px solid ${colors.grey4}`,
    boxSizing: 'border-box',
  },
  innerGrid: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});

class Container extends Component {
  static propTypes = {
    details: PropTypes.shape({
      items: PropTypes.arrayOf(UnimailPropTypes.item).isRequired,
    }).isRequired,
    _id: PropTypes.string.isRequired,
  };

  stopDragPropogation = (l, o, n, p, e) => {
    e.stopPropagation();
  }

  resetLayout() {
    this._shouldReverseLayout = !this._shouldReverseLayout;
    this.forceUpdate();
  }

  generateDOM() {
    const { details } = this.props;
    const { items } = details;
    return items.map(item => (
      <Tacked
        key={item._id}
        {...item.placement}
      >
        <Item item={item} />
      </Tacked>
    ));
  }

  generateLayout() {
    const { items } = this.props.details;
    return items.map(({ _id, placement }) => ({
      x: placement.x,
      y: placement.y,
      w: placement.width,
      h: placement.height,
      i: _id,
    }));
  }

  render() {
    const { _id } = this.props;
    return (
      <div className={css(styles.fit)}>
        <BulletinBoard id={_id} fit>
          {this.generateDOM()}
        </BulletinBoard>
      </div>
    );
  }
}

function mapStateToProps({ editor: { template } }) {
  return { template };
}

export default connect(mapStateToProps)(Container);
