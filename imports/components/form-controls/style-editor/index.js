import React from 'react';
import PropTypes from 'prop-types';

import BackgroundEditor from './background';

export default function StyleEditor({ property, value, onChange, onPreview }) {
  switch (property) {
    case 'background':
      return (
        <BackgroundEditor
          background={value}
          onChange={onChange}
          onPreview={onPreview}
        />
      );
    default:
      return <div>{property}: {value}</div>;
  }
}

StyleEditor.propTypes = {
  property: PropTypes.oneOf([
    'background',
    'border',
  ]).isRequired,
  value: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired,
  onPreview: PropTypes.func.isRequired,
};
