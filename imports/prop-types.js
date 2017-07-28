import React from 'react';
import PropTypes from 'prop-types';
import stylePropType from 'react-style-proptype';

export * from './templates/prop-types';
export * from './organizations/prop-types';
export * from './accounts/prop-types';

// for React Router matches
export const match = PropTypes.shape({
  url: PropTypes.string,
  params: PropTypes.object,
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
  style: stylePropType,
});
