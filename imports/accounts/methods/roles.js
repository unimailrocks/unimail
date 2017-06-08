import { Meteor } from 'meteor/meteor';
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';

import { isRole, addRole, removeRole } from '/imports/accounts';

export const create = new ValidatedMethod({
  name: 'users.roles.create',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    userID: { type: String, regEx: SimpleSchema.RegEx.Id },
    role: { type: String },
  }).validator(),
  run({ userID, role }) {
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
});

export const destroy = new ValidatedMethod({
  name: 'users.roles.delete',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    userID: { type: String, regEx: SimpleSchema.RegEx.Id },
    role: { type: String },
  }).validator(),
  run({ userID, role }) {
    if (isRole(this.userId, 'hyperadmin')) {
      removeRole(userID, role);
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
