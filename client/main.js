import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';

Meteor.startup(() =>
  ReactDOM.render(<App />, document.getElementById('render-target'))
);
