import React, { PropTypes } from 'react';
import { IndexRoute, Route } from 'react-router';
import AdminUsersPage from './page';

export default function AdminUsersRoute(path) {
  return [
    <Route key="list" path={path} component={AdminUsersPage} />
  ];
}
