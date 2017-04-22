import React, { Component, PropTypes } from 'react';
import Tacked from './tacked';

export { Tacked };

export default class BulletinBoard extends Component {
  static propTypes = {
    className: PropTypes.string,
    heightLocked: PropTypes.bool,
    widthLocked: PropTypes.bool,
    minHeight: PropTypes.number,
    children(props, propName, componentName) {
      const children = props[propName];
      const keys = {};
      React.Children.forEach(children, child => {
        if (!child.key) {
          throw new Error(`No key found on child in ${componentName}`);
        }
        if (keys[child.key]) {
          throw new Error(`Duplicate child key "${child.key} found in ${componentName}"`);
        }

        keys[child.key] = true;
      });
    },
  };

  static defaultProps = {
    className: '',
    heightLocked: false,
    widthLocked: false,
    children: [],
    minHeight: 0,
  };

  calculateHeight() {
    const { children, minHeight } = this.props;
    const bottoms = React.Children.map(children, ({ props }) => props.y + props.height);

    return Math.max(...bottoms, minHeight);
  }

  render() {
    const { className, children } = this.props;
    return (
      <div
        className={className}
        style={{ minHeight: `${this.calculateHeight()}px` }}
      >
        {children}
      </div>
    );
  }
}
