import { Meteor } from 'meteor/meteor';
import '/imports/shared';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, IndexRoute, Route, browserHistory } from 'react-router';
import App from '/imports/app';
import Index from '/imports/index';
import { LoginPage, isRole } from '/imports/accounts';
import { AdminRoute } from '/imports/admin';

function requireHyperadmin() {
  if (!isRole('hyperadmin')) {
    if (Meteor.user()) {
      browserHistory.push('/');
    } else {
      browserHistory.push('/login');
    }
  }
}

Meteor.startup(() => {
  ReactDOM.render(
    <Router history={ browserHistory }>
      <Route path="/" component={App}>
        <IndexRoute component={Index} />
        <Route path="login" component={LoginPage} />
        {AdminRoute('admin')}
      </Route>
    </Router>
    , document.getElementById('render-target')
  );
});
