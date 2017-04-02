import React from 'react';
import { Route } from 'react-router-dom';
import UnimailPropTypes from '/imports/prop-types';
import AdminOrganizationsPage from './page';
import AdminOrganizationPage from './organization/page';

export default function AdminUsersIndex({ match }) {
  return (
    <div>
      <Route exact path={match.url} component={AdminOrganizationsPage} />,
      <Route path={`${match.url}/:id`} component={AdminOrganizationPage} />,
    </div>
  );
}

AdminUsersIndex.propTypes = {
  match: UnimailPropTypes.match.isRequired,
};
