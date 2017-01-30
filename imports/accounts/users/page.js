import { Accounts, STATES } from 'meteor/std:accounts-ui';
import React from 'react';

export default function UsersPage() {
  return (
    <div>
      <Accounts.ui.LoginForm
        formState={STATES.PROFILE}
      />
    </div>
  );
}
