import { Meteor } from 'meteor/meteor';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, IndexRoute, Route, browserHistory } from 'react-router';
import App from '/imports/app';
import Index from '/imports/index';
import 'bootstrap/dist/css/bootstrap.css';

Meteor.startup(() =>
  ReactDOM.render(
    <Router history={ browserHistory }>
      <Route path="/" component={App}>
        <IndexRoute component={Index} />
        <Route path="/login" component={Index} />
      </Route>
    </Router>
    , document.getElementById('render-target')
  )
);
