import PropTypes from 'prop-types';

export const source = PropTypes.shape({
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
});

export const placement = PropTypes.shape({
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
});

// in an ideal world, we would make this a oneOf type with each type of item
// its own type, but recursive prop types aren't easy and it has little impact
// in the context of this application
export const item = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['image', 'container']).isRequired,
  placement: placement.isRequired,
  details: PropTypes.object,
  styles: PropTypes.object,
});

export const render = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  renderedAt: PropTypes.instanceOf(Date).isRequired,
  html: PropTypes.string.isRequired,
  // the key in S3 for the preview image
  previewImageKey: PropTypes.string.isRequired,
});

export const template = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  ownershipType: PropTypes.string.isRequired,
  ownerID: PropTypes.string.isRequired,
  editors: PropTypes.arrayOf(PropTypes.string),
  viewers: PropTypes.arrayOf(PropTypes.string),
  sources: PropTypes.arrayOf(source),
  items: PropTypes.arrayOf(item).isRequired,
  renders: PropTypes.arrayOf(render),
  width: PropTypes.number.isRequired,
});

export * from './editor/prop-types';
