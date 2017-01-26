import { Meteor } from 'meteor/meteor';
import '/imports/shared';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, IndexRoute, Route, browserHistory } from 'react-router';
import App from '/imports/app';
import Index from '/imports/index';
import { LoginPage } from '/imports/accounts';
import { AdminUsersPage } from '/imports/admin';

Meteor.startup(() => {
  ReactDOM.render(
    <Router history={ browserHistory }>
      <Route path="/" component={App}>
        <IndexRoute component={Index} />
        <Route path="login" component={LoginPage} />
        <Route path="admin">
          <Route path="users" component={AdminUsersPage} />
        </Route>
      </Route>
    </Router>
    , document.getElementById('render-target')
  );
});
