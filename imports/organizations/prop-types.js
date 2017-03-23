import { PropTypes } from 'react';

export const organization = PropTypes.shape({
  name: PropTypes.string.isRequired,
  permissions: PropTypes.arrayOf(PropTypes.string).isRequired,
});

