/* globals Roles */
import { Meteor } from 'meteor/meteor';

export { LoginPage } from './login';

export function isRole(user, role) {
  return Roles.userIsInRole(user, [role]);
}

export function resolveUser() {
  return new Promise(res => {
    const interval = setInterval(() => {
      if (!Meteor.loggingIn()) {
        clearInterval(interval);
        res(Meteor.user());
      }
    }, 10);
  });
}
