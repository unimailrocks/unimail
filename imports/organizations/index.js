import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Mongo } from 'meteor/mongo';
import { Match } from 'meteor/check';
import { check } from 'meteor/zodiase:check';
import SimpleSchema from 'simpl-schema';
import generatePassword from 'password-generator';

import { isRole, addRole } from '/imports/accounts';

import OrganizationPage from './page';

export { OrganizationPage };

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
  Meteor.publishComposite('organizations', passwordToken => {
    check(passwordToken, Match.OneOf(String, undefined));
    return {
      find() {
        if (!this.userId && passwordToken) {
          return Meteor.users.find({
            'services.password.reset.token': passwordToken,
          });
        }

        return Meteor.users.find({ _id: this.userId });
      },
      children: [
        {
          find(user) {
            if (isRole(user, 'hyperadmin')) {
              return Organizations.find();
            }

            return Organizations.find({
              _id: user.organizationID,
            });
          },
        },
      ],
    };
  });
}

Meteor.methods({
  'organizations.create'(organizationName) {
    check(organizationName, String);

    if (isRole(this.userId, 'hyperadmin')) {
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
    addRole(this.userId, ['organizations.manage', 'organizations.admin']);

    return organizationID;
  },
  'organizations.permissions.create'(organizationID, permissionName) {
    check(organizationID, String);
    check(permissionName, String);
    if (!isRole(this.userId, 'hyperadmin')) {
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
    if (!isRole(this.userId, 'hyperadmin')) {
      throw new Meteor.Error('Not authorized to remove organization permissions');
    }

    return Organizations.update(
      { _id: organizationID },
      { $pull: { permissions: permissionName } },
    );
  },
  'organizations.users.create'(organizationID, userEmail) {
    check(organizationID, String);
    check(userEmail, String);

    if (userEmail.length === 0) {
      throw new Meteor.Error('Please provide a user email');
    }

    const user = Meteor.users.findOne(this.userId);

    const canCreateOrganizationUser =
      isRole(user, 'hyperadmin') ||
      (
        user.organizationID === organizationID &&
        isRole(user, 'organizations.manage')
      );

    if (!canCreateOrganizationUser) {
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
