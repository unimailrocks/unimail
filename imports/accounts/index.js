/* globals Roles */
import { Meteor } from 'meteor/meteor';
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

export async function addRole(userID, role) {
  try {
    await Meteor.callPromise('roles.create', userID, role);
  } catch (e) {
    return e;
  }
}

export async function removeRole(userID, role) {
  try {
    await Meteor.callPromise('roles.delete', userID, role);
  } catch (e) {
    return e;
  }
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
