import { Meteor } from 'meteor/meteor';
import React from 'react';
import ReactDOM from 'react-dom';
import App from '/imports/app';

Meteor.startup(() =>
  ReactDOM.render(<App />, document.getElementById('render-target'))
);
