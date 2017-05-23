import PropTypes from 'prop-types';

export const organization = PropTypes.shape({
  name: PropTypes.string.isRequired,
  permissions: PropTypes.arrayOf(PropTypes.string).isRequired,
});

