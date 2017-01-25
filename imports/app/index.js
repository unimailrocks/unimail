import React, { PropTypes } from 'react';
import Header from '/imports/header';

export default function App({ children }) {
  return (
    <div>
      <Header />
      {children}
    </div>
  );
}

App.propTypes = {
  children: PropTypes.element,
};
