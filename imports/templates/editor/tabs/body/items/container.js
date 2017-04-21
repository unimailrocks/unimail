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
    placement: UnimailPropTypes.placement.isRequired,
    path: PropTypes.arrayOf(PropTypes.string).isRequired,
  };

  onLayoutChange = async newLayout => {
    const { items } = this.props.details;
    const { path } = this.props;
    const results = await Promise.all(newLayout.map(async layoutItem => {
      const relatedItem = find({ _id: layoutItem.i }, items);
      const itemDimensions = {
        width: layoutItem.w,
        height: layoutItem.h,
        x: layoutItem.x,
        y: layoutItem.y,
      };

      if (isMatch(itemDimensions, relatedItem.placement)) {
        return false;
      }

      try {
        await Templates.Items.moveItem.callPromise({
          templateID: this.props.template._id,
          placement: itemDimensions,
          path: [...path, relatedItem._id],
        });
      } catch (err) {
        console.error('>.< some error', err);
      }

      return true;
    }));

    // if any of them need a re-layout
    // then reset the layout
    if (results.reduce((a, b) => a || b, false)) {
      this.resetLayout();
    }
  };

  stopDragPropogation = (l, o, n, p, e) => {
    e.stopPropagation();
  }

  resetLayout() {
    this._shouldReverseLayout = !this._shouldReverseLayout;
    this.forceUpdate();
  }

  generateDOM() {
    const { path, details } = this.props;
    const { items } = details;
    return items.map(item => (
      <div style={{ zIndex: path.length }} key={item._id}>
        <Item item={item} path={path} />
      </div>
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
    const { placement } = this.props;
    const layout = this.generateLayout();

    // reverse layout if we're trying to force a re-layout
    // works because ids still match up with keys but
    // array is not _.isEqual (which is used internally)
    // in ReactGridLayout
    if (this._shouldReverseLayout) {
      layout.reverse();
    }

    return (
      <div className={css(styles.fit, containerStyles.bordered)}>
        <ReactGridLayout
          onDragStart={this.stopDragPropogation}
          className={css(containerStyles.innerGrid)}
          width={placement.width}
          cols={placement.width}
          onLayoutChange={this.onLayoutChange}
          rowHeight={1}
          margin={[0, 0]}
          verticalCompact={false}
          layout={layout}
        >
          {this.generateDOM()}
        </ReactGridLayout>
      </div>
    );
  }
}

function mapStateToProps({ editor: { template } }) {
  return { template };
}

export default connect(mapStateToProps)(Container);
