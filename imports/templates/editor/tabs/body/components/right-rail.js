import PropTypes from 'prop-types';
import React from 'react';
import { Rail, Segment } from 'semantic-ui-react';

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
  contentType: PropTypes.oneOf([]),
  content: PropTypes.oneOfType([]),
};

TemplateBodyRightRail.defaultProps = {
  contentType: null,
  content: null,
};
