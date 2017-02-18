import React, { PropTypes } from 'react';
import { Rail, Segment } from 'semantic-ui-react';

export default function TemplateBodyLeftRail() {
  return (
    <Rail attached position="left">
      <Segment raised>
        Dolphins
      </Segment>
    </Rail>
  );
}
