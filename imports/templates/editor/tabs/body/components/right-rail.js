import React, { PropTypes } from 'react';
import { Rail, Segment } from 'semantic-ui-react';

import UnimailPropTypes from '/imports/prop-types';

import ContentForm from './content-form';

export default function TemplateBodyRightRail(props) {
  if (!props.contentType) {
    return null;
  }

  return (
    <Rail attached position="right">
      <Segment raised>
        <ContentForm key={props.content._id} {...props} />
      </Segment>
    </Rail>
  );
}

TemplateBodyRightRail.propTypes = {
  contentType: PropTypes.oneOf(['row']),
  content: PropTypes.oneOfType([UnimailPropTypes.row]),
};

TemplateBodyRightRail.defaultProps = {
  contentType: null,
  content: null,
};
