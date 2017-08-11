import React from 'react';

import colors from '/imports/styles/colors';

export const zIndex = 1000;

export default function DeletingShroud({ onDelete }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex,
        backgroundColor: colors.black.alpha('0.2').toString(),
        color: colors.white.toString(),
      }}
    >
      Are you sure you want to delete these elements?
    </div>
  );
}
