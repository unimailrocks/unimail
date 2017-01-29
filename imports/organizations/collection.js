import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import SimpleSchema from 'simpl-schema';

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
});
