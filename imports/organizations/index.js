import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import SimpleSchema from 'simpl-schema';
import generatePassword from 'password-generator';

export const Organizations = new Mongo.Collection('organizations');

Organizations.attachSchema(new SimpleSchema({
  name: {
    type: String,
  },
  permissions: {
    type: Array,
  },
  'permissions.$': {
    type: String,
  },
}));

if (Meteor.isServer) {
  Meteor.publish('organizations', function publishOrganizations() {
    if (Roles.userIsInRole(this.userId, ['hyperadmin'])) {
      return Organizations.find({});
    }

    const user = Meteor.users.findOne(this.userId);
    if (user.organizationID) {
      return Organizations.findOne(user.organizationID);
    }

    return this.ready();
  });
}

Meteor.methods({
  'organizations.create'(organizationName) {
    check(organizationName, String);
    if (!Roles.userIsInRole(this.userId, ['hyperadmin'])) {
      throw new Meteor.Error('Not authorized to create new organization!');
    }
    return Organizations.insert({
      name: organizationName,
      permissions: [],
    });
  },
  'organizations.permissions.create'(organizationID, permissionName) {
    check(organizationID, String);
    check(permissionName, String);
    if (!Roles.userIsInRole(this.userId, ['hyperadmin'])) {
      throw new Meteor.Error('Not authorized to give organizations permissions!');
    }

    return Organizations.update(
      { _id: organizationID },
      { $push: { permissions: permissionName } },
    );
  },
  'organizations.permissions.remove'(organizationID, permissionName) {
    check(organizationID, String);
    check(permissionName, String);
    if (!Roles.userIsInRole(this.userId, ['hyperadmin'])) {
      throw new Meteor.Error('Not authorized to create new organization!');
    }

    return Organizations.update(
      { _id: organizationID },
      { $pull: { permissions: permissionName } },
    );
  },
  'organizations.users.create'(organizationID, userEmail) {
    check(organizationID, String);
    check(userEmail, String);
    if (!Roles.userIsInRole(this.userId, ['hyperadmin'])) {
      throw new Meteor.Error('Not authorized to create new organization user!');
    }
    const password = generatePassword();
    Accounts.createUser({
      email: userEmail,
      password,
      organizationID,
    });

    return { password };
  },
});
