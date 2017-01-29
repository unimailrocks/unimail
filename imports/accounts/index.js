import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { check } from 'meteor/zodiase:check';

export { LoginPage } from './login';

export function isRole(user, role) {
  return Roles.userIsInRole(user, [role]);
}

export function resolveUser() {
  return new Promise(res => {
    const interval = setInterval(() => {
      // roles load later but are important
      if (!Meteor.loggingIn() && Meteor.user().roles) {
        clearInterval(interval);
        res(Meteor.user());
      }
    }, 10);
  });
}

Meteor.methods({
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
