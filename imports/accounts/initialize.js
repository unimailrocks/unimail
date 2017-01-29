/* globals Accounts, Roles */
import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';

export default function initializeAccounts() {
  Accounts.ui.config({
    passwordSignupFields: 'EMAIL_ONLY',
  });

  if (Meteor.isServer) {
    serverSide();
  } else {
    clientSide();
  }
}

function attachSchema() {
  const countrySchema = new SimpleSchema({
    name: {
      type: String,
    },
    code: {
      type: String,
      regEx: /^[A-Z]{2}$/,
    },
  });

  const profileSchema = new SimpleSchema({
    firstName: {
      type: String,
      optional: true,
    },
    lastName: {
      type: String,
      optional: true,
    },
    birthday: {
      type: Date,
      optional: true,
    },
    gender: {
      type: String,
      allowedValues: ['Male', 'Female', 'Other'],
      optional: true,
    },
    organization: {
      type: String,
      optional: true,
    },
    website: {
      type: String,
      regEx: SimpleSchema.RegEx.Url,
      optional: true,
    },
    bio: {
      type: String,
      optional: true,
    },
    country: {
      type: countrySchema,
      optional: true,
    },
  });

  const schema = new SimpleSchema({
    username: {
      type: String,
      optional: true,
    },
    emails: {
      type: Array,
      optional: true,
    },
    'emails.$': {
      type: Object,
    },
    'emails.$.address': {
      type: String,
      regEx: SimpleSchema.RegEx.Email,
    },
    'emails.$.verified': {
      type: Boolean,
    },
    createdAt: {
      type: Date,
    },
    profile: {
      type: profileSchema,
      optional: true,
    },
    services: {
      type: Object,
      optional: true,
      blackbox: true,
    },
    roles: {
      type: Object,
      optional: true,
      blackbox: true,
    },
    'roles.$': {
      type: String,
    },
    heartbeat: {
      type: Date,
      optional: true,
    },
    organizationID: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
  });

  Meteor.users.attachSchema(schema);
}

function serverSide() {
  attachSchema();
  const user = Accounts.findUserByEmail('ben.m.berman@gmail.com');
  if (user) {
    Roles.addUsersToRoles(user._id, ['hyperadmin']);
  }

  Meteor.publish('usersForAdmin', function publishUsers() {
    if (Roles.userIsInRole(this.userId, ['hyperadmin'])) {
      return Meteor.users.find({});
    }

    return this.ready();
  });
}

function clientSide() {

}
