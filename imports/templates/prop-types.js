import { PropTypes } from 'react';

export const source = PropTypes.shape({
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
});

export const row = PropTypes.shape({
  height: PropTypes.number.isRequired,
});

export const template = PropTypes.shape({
  title: PropTypes.string.isRequired,
  ownershipType: PropTypes.string.isRequired,
  ownerID: PropTypes.string.isRequired,
  editors: PropTypes.arrayOf(PropTypes.string),
  viewers: PropTypes.arrayOf(PropTypes.string),
  sources: PropTypes.arrayOf(source),
  rows: PropTypes.arrayOf(row),
  rowDiffs: PropTypes.arrayOf(PropTypes.any).isRequired,
});

