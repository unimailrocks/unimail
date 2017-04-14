import React, { Component, PropTypes } from 'react';
import { StyleSheet, css } from 'aphrodite';
import ReactGridLayout from 'react-grid-layout';

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

export default class Container extends Component {
  static propTypes = {
    depth: PropTypes.number.isRequired,
    details: PropTypes.shape({
      items: PropTypes.arrayOf(UnimailPropTypes.item).isRequired,
    }).isRequired,
    placement: UnimailPropTypes.placement.isRequired,
  };

  onLayoutChange = () => {
  };

  stopDragPropogation = (l, o, n, p, e) => {
    e.stopPropagation();
  }

  generateDOM() {
    const { depth, details } = this.props;
    const { items } = details;
    return items.map(item => (
      <div style={{ zIndex: depth }}key={item._id}>
        <Item item={item} depth={depth + 1} />
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
          layout={this.generateLayout()}
        >
          {this.generateDOM()}
        </ReactGridLayout>
      </div>
    );
  }
}
