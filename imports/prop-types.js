import { PropTypes } from 'react';
import { template, row, source } from './templates/prop-types';
import { organization } from './organizations/prop-types';
import { user } from './accounts/prop-types';

// for React Router matches
const match = PropTypes.shape({
  url: PropTypes.string,
  params: PropTypes.object,
});

export default {
  template,
  row,
  source,
  organization,
  user,
  match,
};
