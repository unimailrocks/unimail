import React from 'react';
import UnimailPropTypes from '/imports/prop-types';

export default function RunTab({ template }) {
  return (
    <div>
      <h2>Render &ldquo;{template.title}&rdquo;</h2>
    </div>
  );
}

RunTab.propTypes = {
  template: UnimailPropTypes.template.isRequired,
};
