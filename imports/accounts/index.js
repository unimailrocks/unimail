import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';

export { LoginPage } from './login';
export { RegisterPage } from './register';
export { UsersPage } from './users';
export { EnrollPage } from './enroll';

Meteor.users.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

export function isRole(user, role) {
  return Roles.userIsInRole(user, [role]);
}

export function addRole(user, role) {
  Roles.addUsersToRoles(user, role);
}

export function removeRole(user, role) {
  Roles.removeUsersFromRoles(user, role);
}

export function getRoles(user) {
  return Roles.getAllRoles(user).fetch().map(({ name }) => name);
}

export * from './methods';
