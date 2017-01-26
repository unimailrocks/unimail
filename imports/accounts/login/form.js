import React from 'react';
import { Accounts } from 'meteor/std:accounts-ui';

export default function LoginForm() {
  return <Accounts.ui.LoginForm />;
}
