import React, { PropTypes } from 'react';
import UnimailPropTypes from '/imports/prop-types';

export default function ContentForm(props) {
  switch (props.contentType) {
    default:
      return null;
  }
}

ContentForm.propTypes = {
  contentType: PropTypes.oneOf([]).isRequired,
  content: PropTypes.oneOfType([
  ]).isRequired,
};
