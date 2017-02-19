import { Meteor } from 'meteor/meteor';
import '/imports/shared';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, IndexRoute, Route, browserHistory } from 'react-router';
import App from '/imports/app';
import Index from '/imports/index';
import { RegisterPage, LoginPage, resolveUser, UsersPage } from '/imports/accounts';
import { AdminRoute } from '/imports/admin';
import { TemplatesRoute } from '/imports/templates';

Meteor.startup(async () => {
  await resolveUser();
  ReactDOM.render(
    <Router history={browserHistory}>
      <Route path="/" component={App}>
        <IndexRoute component={Index} />
        <Route path="login" component={LoginPage} />
        <Route path="register" component={RegisterPage} />
        <Route path="me" component={UsersPage} />
        {AdminRoute('admin')}
        {TemplatesRoute('templates')}
      </Route>
    </Router>
    , document.getElementById('render-target'),
  );
});
