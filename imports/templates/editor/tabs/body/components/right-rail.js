import React, { PropTypes } from 'react';
import { Rail, Segment } from 'semantic-ui-react';

export default function TemplateBodyRightRail({ content, contentType }) {
  return (
    <Rail attached position="right">
      <Segment raised>
        {contentType} {content && content._id}
      </Segment>
    </Rail>
  );
}

TemplateBodyRightRail.propTypes = {
  contentType: PropTypes.string,
  content: PropTypes.shape({
    _id: PropTypes.string.isRequired,
  }),
};

TemplateBodyRightRail.defaultProps = {
  contentType: null,
  content: null,
};
