import React from 'react';
import { Route } from 'react-router-dom';
import Header from '/imports/header';
import Index from '/imports/index';
import {
  RegisterPage,
  LoginPage,
  UsersPage,
  EnrollPage,
} from '/imports/accounts';
import { AdminPage } from '/imports/admin';
import { TemplatesRouter } from '/imports/templates';
import { OrganizationPage } from '/imports/organizations';

export default function App() {
  return (
    <div>
      <Header />
      <Route exact path="/" component={Index} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/me" component={UsersPage} />
      <Route path="/organization" component={OrganizationPage} />
      <Route path="/enroll/:token" component={EnrollPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/templates" component={TemplatesRouter} />
    </div>
  );
}
