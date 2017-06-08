import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';

import { isRole } from '/imports/accounts';

export const create = new ValidatedMethod({
  name: 'users.create',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    email: { type: String, regEx: SimpleSchema.RegEx.Email },
    password: { type: String },
  }).validator(),
  run({ email, password }) {
    Accounts.createUser({
      email,
      password,
    });
  },
});

export const enroll = new ValidatedMethod({
  name: 'users.enroll',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    passwordToken: { type: String },
    password: { type: String },
  }).validator(),
  run({ passwordToken, password }) {
    const user = Meteor.users.findOne({
      'services.password.reset.token': passwordToken,
    });

    if (Meteor.isServer) {
      if (!user) {
        throw new Meteor.Error('Invalid reset token');
      }

      Accounts.setPassword(user._id, password);
    }
  },
});

export const destroy = new ValidatedMethod({
  name: 'users.destroy',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    userID: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator(),
  run({ userID }) {
    if (isRole(this.userId, 'hyperadmin')) {
      Meteor.users.remove({ _id: userID });
      return;
    }

    const thisUser = Meteor.users.findOne(this.userId);

    if (this.userId === userID && !thisUser.organizationID) {
      Meteor.users.remove({ _id: userID });
      return;
    } else if (this.userId === userID) {
      throw new Meteor.Error('Cannot delete own user if a member of an organization');
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
});

export * as roles from './roles';
export * as apiTokens from './tokens';
