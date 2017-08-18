import React from 'react';
import PropTypes from 'prop-types';
import stylePropType from 'react-style-proptype';
import Color from 'color';

export * from './templates/prop-types';
export * from './organizations/prop-types';
export * from './accounts/prop-types';

// for React Router matches
export const match = PropTypes.shape({
  url: PropTypes.string,
  params: PropTypes.object,
});

const addRequired = fn => { fn.isRequired = (...args) => fn(...args, true); };

function checkChildren(props, propName, componentName) {
  const children = props[propName];
  const keys = {};
  React.Children.forEach(children, child => {
    if (!child.key && children.length > 0) {
      return new Error(`No key found on child in ${componentName}`);
    }
    if (keys[child.key]) {
      return new Error(`Duplicate child key "${child.key}" found in ${componentName}`);
    }

    keys[child.key] = true;
  });
}

export function children(props, propName, componentName, required = false) {
  if (!required && props[propName] == null) {
    return;
  }

  checkChildren(props, propName, componentName);
}

addRequired(children);

export function color(props, propName, componentName, required = false) {
  if (!required && props[propName] == null) {
    return;
  }

  if (props[propName] instanceof Color) {
    return;
  }

  return new Error(`Prop \`${propName}\` in ${componentName} must be a Color`);
}

addRequired(color);

export const style = stylePropType;
