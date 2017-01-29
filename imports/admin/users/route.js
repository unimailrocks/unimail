import React from 'react';
import { IndexRoute, Route } from 'react-router';
import AdminUsersPage from './page';
import AdminUserPage from './user/page';

export default function AdminUsersRoute(path) {
  return [
    <Route key="index" path={path} component={AdminUsersPage} />,
    <Route key="get" path={`${path}/:id`} component={AdminUserPage} />,
  ];
}
