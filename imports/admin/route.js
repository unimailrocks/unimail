import React from 'react';
import { Route } from 'react-router';
import AdminPage from './page';
import AdminUsersRoute from './users/route';

export default function AdminRoute(path) {
  return (
    <Route path={path} component={AdminPage}>
      {AdminUsersRoute('users')}
    </Route>
  );
}

