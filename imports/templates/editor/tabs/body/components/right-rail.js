import React, { PropTypes } from 'react';
import { Rail, Segment } from 'semantic-ui-react';

export default function TemplateBodyRightRail() {
  return (
    <Rail attached position="right">
      <Segment raised>
        Salamanders
      </Segment>
    </Rail>
  );
}
