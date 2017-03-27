import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import { check } from 'meteor/zodiase:check';

export { LoginPage } from './login';
export { RegisterPage } from './register';
export { UsersPage } from './users';
export { EnrollPage } from './enroll';

export function isRole(user, role) {
  return Roles.userIsInRole(user, [role]);
}

Meteor.methods({
  'users.create'(email, password) {
    check(email, String);
    check(password, String);
    Accounts.createUser({
      email,
      password,
    });
  },
  'users.enroll'(passwordToken, password) {
    check(passwordToken, String);
    check(password, String);

    const user = Meteor.users.findOne({
      'services.password.reset.token': passwordToken,
    });

    if (Meteor.isServer) {
      Accounts.setPassword(user._id, password);
    }
  },
  'roles.create'(userID, role) {
    check(userID, String, 'User ID must be a string.');
    check(role, String, 'Role must be a string.');
    if (Roles.userIsInRole(this.userId, 'hyperadmin')) {
      Roles.addUsersToRoles(userID, role);
    }
  },
  'roles.delete'(userID, role) {
    check(userID, String, 'User ID must be a string.');
    check(role, String, 'Role must be a string.');
    if (Roles.userIsInRole(this.userId, 'hyperadmin')) {
      Roles.removeUsersFromRoles(userID, role);
    }
  },
});
