import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { css } from 'aphrodite';
import UnimailPropTypes from '/imports/prop-types';
import colors from '/imports/styles/colors';
import styles from '/imports/styles/functional';

import Container from './container';

class Item extends Component {
  static propTypes = {
    item: UnimailPropTypes.item.isRequired,
    path: PropTypes.arrayOf(PropTypes.string),
  };

  static defaultProps = {
    path: [],
    guided: true,
  };

  renderItem() {
    const { item, path } = this.props;
    switch (item.type) {
      case 'image':
        return (
          <div
            className={css(styles.fit)}
            style={{ backgroundColor: colors.grey4.string() }}
          >
            {path.map(([c]) => c).toString()}
          </div>
        );
      case 'container':
        return <Container {...item} path={[...path, item._id]} />;
      default:
        return <div />;
    }
  }

  render() {
    return (
      <div
        className={css(styles.fit)}
      >
        {this.renderItem()}
      </div>
    );
  }
}

function mapStateToProps({ editor: { modes: { guided } } }) {
  return { guided };
}

export default connect(mapStateToProps)(Item);
