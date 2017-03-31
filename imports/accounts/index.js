import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import { check } from 'meteor/zodiase:check';

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
  'users.delete'(userID) {
    check(userID, String);

    if (isRole(this.userId, 'hyperadmin')) {
      Meteor.users.remove({ _id: userID });
      return;
    }

    const thisUser = Meteor.users.findOne(this.userId);

    if (this.userId === userID && !thisUser.organizationID) {
      Meteor.users.remove({ _id: userID });
      return;
    } else if (this.userId === userID) {
      throw new Meteor.Error('Cannot delete own user if ');
    }

    const thatUser = Meteor.users.findOne(userID);

    if (!thatUser ||
        !thatUser.organizationID ||
        thisUser.organizationID !== thatUser.organizationID) {
      throw new Meteor.Error('This user does not exist');
    }

    if (!isRole(this.userId, 'organizations.admin') && !isRole(this.userId, 'organizations.manage')) {
      throw new Meteor.Error('You do not have the permissions to remove other users');
    }

    if (isRole(userID, 'organizations.admin') && !isRole(this.userId, 'organizations.admin')) {
      throw new Meteor.Error('You cannot remove an admin');
    }

    Meteor.users.remove({ _id: userID });
  },
  'roles.create'(userID, role) {
    check(userID, String, 'User ID must be a string.');
    check(role, String, 'Role must be a string.');
    if (isRole(this.userId, 'hyperadmin')) {
      addRole(userID, role);
      return;
    }

    if (this.userId === userID) {
      throw new Meteor.Error('You cannot modify your own permissions');
    }

    const thisUser = Meteor.users.findOne(this.userId);
    const thatUser = Meteor.users.findOne(userID);

    if (!thatUser ||
        !thatUser.organizationID ||
        thisUser.organizationID !== thatUser.organizationID) {
      throw new Meteor.Error('This user does not exist');
    }

    if (!isRole(this.userId, 'organizations.admin') && !isRole(this.userId, 'organizations.manage')) {
      throw new Meteor.Error('You do not have the permissions to add permissions to other users');
    }

    switch (role) {
      case 'organizations.admin':
        if (!isRole(this.userId, 'organizations.admin')) {
          throw new Meteor.Error('You need to be an admin of your organization to make others admins');
        }
        break;
      case 'organizations.manage':
      case 'templates.design':
      case 'templates.render':
        break;
      default:
        throw new Meteor.Error(`Permission ${role} does not exist`);
    }

    addRole(userID, role);
  },
  'roles.delete'(userID, role) {
    check(userID, String, 'User ID must be a string.');
    check(role, String, 'Role must be a string.');
    if (Roles.userIsInRole(this.userId, 'hyperadmin')) {
      Roles.removeUsersFromRoles(userID, role);
      return;
    }

    if (this.userId === userID) {
      throw new Meteor.Error('You cannot modify your own permissions');
    }

    const thisUser = Meteor.users.findOne(this.userId);
    const thatUser = Meteor.users.findOne(userID);

    if (!thatUser ||
        !thatUser.organizationID ||
        thisUser.organizationID !== thatUser.organizationID) {
      throw new Meteor.Error('This user does not exist');
    }

    if (!isRole(this.userId, 'organizations.admin') && !isRole(this.userId, 'organizations.manage')) {
      throw new Meteor.Error('You do not have the permissions to remove permissions from other users');
    }

    switch (role) {
      case 'organizations.admin':
        if (!isRole(this.userId, 'organizations.admin')) {
          throw new Meteor.Error('You need to be an admin of your organization to remove admin privileges');
        }
        break;
      case 'organizations.manage':
      case 'templates.design':
      case 'templates.render':
        break;
      default:
        throw new Meteor.Error(`Permission ${role} does not exist`);
    }

    removeRole(userID, role);
  },
});
