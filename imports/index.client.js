import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import '/imports/shared';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, IndexRoute, Route, browserHistory } from 'react-router';
import { Dimmer, Loader } from 'semantic-ui-react';
import App from '/imports/app';
import UnimailPropTypes from '/imports/prop-types';
import Index from '/imports/index';
import {
  RegisterPage,
  LoginPage,
  UsersPage,
  EnrollPage,
} from '/imports/accounts';
import { AdminRoute } from '/imports/admin';
import { TemplatesRoute } from '/imports/templates';

function Routes({ user }) {
  if (!user) {
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
        <Route path="enroll/:token" component={EnrollPage} />
        {AdminRoute('admin')}
        {TemplatesRoute('templates')}
      </Route>
    </Router>
  );
}

Routes.propTypes = {
  user: UnimailPropTypes.user,
};

Routes.defaultProps = {
  user: null,
};

const ContainedRoutes = createContainer(() => {
  Meteor.subscribe('myUser');
  return { user: Meteor.user() };
}, Routes);

Meteor.startup(async () => {
  ReactDOM.render(
    <ContainedRoutes />
    , document.getElementById('render-target'),
  );
});
