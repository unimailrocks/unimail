import React from 'react';
import { Route } from 'react-router-dom';
import UnimailPropTypes from '/imports/prop-types';
import AdminUsersPage from './page';
import AdminUserPage from './user/page';

export default function AdminUsersIndex({ match }) {
  return (
    <div>
      <Route exact path={match.url} component={AdminUsersPage} />,
      <Route path={`${match.url}/:id`} component={AdminUserPage} />,
    </div>
  );
}

AdminUsersIndex.propTypes = {
  match: UnimailPropTypes.match.isRequired,
};
