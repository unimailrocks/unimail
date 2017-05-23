import PropTypes from 'prop-types';

export const user = PropTypes.shape({
  emails: PropTypes.arrayOf(PropTypes.shape({
    address: PropTypes.string.isRequired,
    verified: PropTypes.bool.isRequired,
  })),
  organizationID: PropTypes.string,
});
