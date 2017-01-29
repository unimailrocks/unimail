import React from 'react';
import { Route } from 'react-router';
import AdminPage from './page';
import AdminUsersRoute from './users/route';
import AdminOrganizationsRoute from './organizations/route';

export default function AdminRoute(path) {
  return (
    <Route path={path} component={AdminPage}>
      {AdminUsersRoute('users')}
      {AdminOrganizationsRoute('organizations')}
    </Route>
  );
}

