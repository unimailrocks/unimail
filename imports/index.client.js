import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import '/imports/shared';
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Router, IndexRoute, Route, browserHistory } from 'react-router';
import { Dimmer, Loader } from 'semantic-ui-react';
import App from '/imports/app';
import Index from '/imports/index';
import {
  RegisterPage,
  LoginPage,
  UsersPage,
  EnrollPage,
} from '/imports/accounts';
import { AdminRoute } from '/imports/admin';
import { TemplatesRoute } from '/imports/templates';
import { OrganizationPage } from '/imports/organizations';

function Routes({ userLoading }) {
  if (userLoading) {
    return (
      <Dimmer active>
        <Loader />
      </Dimmer>
    );
  }

  return (
    <Router history={browserHistory}>
      <Route path="/" component={App}>
        <IndexRoute component={Index} />
        <Route path="login" component={LoginPage} />
        <Route path="register" component={RegisterPage} />
        <Route path="me" component={UsersPage} />
        <Route path="organization" component={OrganizationPage} />
        <Route path="enroll/:token" component={EnrollPage} />
        {AdminRoute('admin')}
        {TemplatesRoute('templates')}
      </Route>
    </Router>
  );
}

Routes.propTypes = {
  userLoading: PropTypes.bool.isRequired,
};

const ContainedRoutes = createContainer(() => {
  Meteor.subscribe('myUser');
  return { user: Meteor.user(), userLoading: Meteor.loggingIn() };
}, Routes);

Meteor.startup(async () => {
  ReactDOM.render(
    <ContainedRoutes />
    , document.getElementById('render-target'),
  );
});
