import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { css } from 'aphrodite';
import { connect } from 'react-redux';

import UnimailPropTypes from '/imports/prop-types';
import styles from '/imports/styles/functional';

import BulletinBoard, { Tacked } from '../components/bulletin-board';

import Item from '.';

class Container extends Component {
  static propTypes = {
    details: PropTypes.shape({
      items: PropTypes.arrayOf(UnimailPropTypes.item).isRequired,
    }).isRequired,
    _id: PropTypes.string.isRequired,
    guided: PropTypes.bool.isRequired,
  };

  stopDragPropogation = (l, o, n, p, e) => {
    e.stopPropagation();
  }

  resetLayout() {
    this._shouldReverseLayout = !this._shouldReverseLayout;
    this.forceUpdate();
  }

  generateDOM() {
    const { details, guided } = this.props;
    const { items } = details;
    return items.map(item => (
      <Tacked
        key={item._id}
        bounded={guided}
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

function mapStateToProps({ editor: { template, modes: { guided } } }) {
  return { template, guided };
}

export default connect(mapStateToProps)(Container);
