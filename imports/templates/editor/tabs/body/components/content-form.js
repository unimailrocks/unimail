import React, { PropTypes } from 'react';
import UnimailPropTypes from '/imports/prop-types';
import EditRowForm from './edit-row-form';

export default function ContentForm(props) {
  switch (props.contentType) {
    case 'row':
      return <EditRowForm row={props.content} {...props} />;
    default:
      return null;
  }
}

ContentForm.propTypes = {
  contentType: PropTypes.oneOf(['row']).isRequired,
  content: PropTypes.oneOfType([
    UnimailPropTypes.row,
  ]).isRequired,
};
