import PropTypes from 'prop-types';

export const apiToken = PropTypes.shape({
  key: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
});

export const user = PropTypes.shape({
  emails: PropTypes.arrayOf(PropTypes.shape({
    address: PropTypes.string.isRequired,
    verified: PropTypes.bool.isRequired,
  })),
  apiTokens: PropTypes.arrayOf(apiToken),
  organizationID: PropTypes.string,
});
