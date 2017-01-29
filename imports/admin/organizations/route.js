import React from 'react';
import { IndexRoute, Route } from 'react-router';
import AdminOrganizationsPage from './page';

export default function AdminUsersRoute(path) {
  return [
    <Route key="index" path={path} component={AdminOrganizationsPage} />,
  ];
}
