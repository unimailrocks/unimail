import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Mongo } from 'meteor/mongo';
import { check, Match } from 'meteor/check';
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
  Meteor.publish('organizations', function publishOrganizations(passwordToken) {
    check(passwordToken, Match.OneOf(String, undefined));
    if (!this.userId && passwordToken) {
      const user = Meteor.users.findOne({
        'services.password.reset.token': passwordToken,
      });

      if (!user) {
        return this.ready();
      }

      return Organizations.find({ _id: user.organizationID });
    } else if (!this.userId) {
      return this.ready();
    }

    if (Roles.userIsInRole(this.userId, ['hyperadmin'])) {
      return Organizations.find({});
    }

    const user = Meteor.users.findOne(this.userId);
    if (user.organizationID) {
      return Organizations.find({ _id: user.organizationID });
    }

    return this.ready();
  });
}

Meteor.methods({
  'organizations.create'(organizationName) {
    check(organizationName, String);

    if (Roles.userIsInRole(this.userId, ['hyperadmin'])) {
      return Organizations.insert({
        name: organizationName,
        permissions: [],
      });
    }

    const user = Meteor.users.findOne(this.userId);

    if (!user) {
      throw new Meteor.Error('Must be logged in to create an organization');
    }

    if (user.organizationID) {
      throw new Meteor.Error('User already has an organization');
    }

    const organizationID = Organizations.insert({
      name: organizationName,
      permissions: [],
    });

    Meteor.users.update(this.userId, { $set: { organizationID } });

    return organizationID;
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
    const userID = Accounts.createUser({
      email: userEmail,
      password,
      organizationID,
    });

    if (Meteor.isServer) {
      Accounts.sendEnrollmentEmail(userID);
    }

    return { password };
  },
});
