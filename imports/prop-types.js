import PropTypes from 'prop-types';

export * from './templates/prop-types';
export * from './organizations/prop-types';
export * from './accounts/prop-types';

// for React Router matches
export const match = PropTypes.shape({
  url: PropTypes.string,
  params: PropTypes.object,
});
