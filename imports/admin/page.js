import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import UnimailPropTypes from '/imports/prop-types';
import { isRole } from '/imports/accounts';
import AdminIndex from './index-page';
import AdminUsersPage from './users';
import AdminOrganizationsPage from './organizations';

function AdminPage({ shouldRedirect, match }) {
  if (shouldRedirect) {
    return <Redirect to="/" />;
  }

  return (
    <div>
      <Route exact path={match.url} component={AdminIndex} />
      <Route path={`${match.url}/users`} component={AdminUsersPage} />
      <Route path={`${match.url}/organizations`} component={AdminOrganizationsPage} />
    </div>
  );
}

AdminPage.propTypes = {
  shouldRedirect: PropTypes.bool.isRequired,
  match: UnimailPropTypes.match.isRequired,
};

export default createContainer(() => ({
  shouldRedirect: !Meteor.loggingIn() && !isRole(Meteor.user(), 'hyperadmin'),
}), AdminPage);
