import PropTypes from 'prop-types';
import React from 'react';

import SourcesTab from './sources';
import BodyTab from './body';
import RunTab from './run';

export default function EditorTab(props) {
  switch (props.name) {
    case 'sources':
      return <SourcesTab {...props} />;
    case 'body':
      return <BodyTab {...props} />;
    case 'run':
      return <RunTab {...props} />;
    default:
      return <div />;
  }
}

EditorTab.propTypes = {
  name: PropTypes.string.isRequired,
};
