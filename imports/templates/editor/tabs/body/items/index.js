import { isEqual } from 'lodash/fp';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import UnimailPropTypes from '/imports/prop-types';
import colors from '/imports/styles/colors';
import functionalStyles from '/imports/styles/functional';

import Container from './container';

const styles = StyleSheet.create({
  hoveredItem: {
    boxShadow: `0 0 1em ${colors.blue.alpha(0.5).toString()}}`,
  },
});

class Item extends Component {
  static propTypes = {
    item: UnimailPropTypes.item.isRequired,
    path: PropTypes.arrayOf(PropTypes.string),
    hovered: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    path: [],
  };

  get fullPath() {
    return [...this.props.path, this.props.item._id];
  }

  renderItem() {
    const { item } = this.props;
    switch (item.type) {
      case 'image':
        return (
          <div
            className={css(functionalStyles.fit)}
            style={{ backgroundColor: colors.grey4.string() }}
          >
            {this.fullPath.map(([c]) => c).toString()}
          </div>
        );
      case 'container':
        return <Container {...item} path={this.fullPath} />;
      default:
        return <div />;
    }
  }

  render() {
    return (
      <div
        className={css(
          functionalStyles.fit,
          this.props.hovered && styles.hoveredItem,
        )}
      >
        {this.renderItem()}
      </div>
    );
  }
}

function mapStateToProps({ editor: { hoveredItemPath } }, { path = [], item: { _id } }) {
  return { hovered: isEqual([...path, _id], hoveredItemPath) };
}

export default connect(mapStateToProps)(Item);
