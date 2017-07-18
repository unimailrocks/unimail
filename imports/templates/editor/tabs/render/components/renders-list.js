import React from 'react';
import PropTypes from 'prop-types';
import Infinite from 'react-infinite';
import ContainerDimensions from 'react-container-dimensions';
import UnimailPropTypes from '/imports/prop-types';
import Render from './render';

export default function RendersList({ renders }) {
  const sortedRenders = [...renders];
  sortedRenders.sort((a, b) => b.renderedAt - a.renderedAt);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      <ContainerDimensions>
        {({ height }) => (
          <Infinite
            containerHeight={height}
            elementHeight={200}
          >
            {sortedRenders.map(r => (
              <Render key={r._id} render={r} />
            ))}
          </Infinite>
        )}
      </ContainerDimensions>
    </div>
  );
}

RendersList.propTypes = {
  renders: PropTypes.arrayOf(UnimailPropTypes.render).isRequired,
};
