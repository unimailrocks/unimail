/* globals Accounts */
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import SimpleSchema from 'simpl-schema';

export default function initializeAccounts() {
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
      optional: true,
    },
    apiTokens: {
      type: Array,
      defaultValue: [],
    },
    'apiTokens.$': {
      type: Object,
    },
    'apiTokens.$.key': {
      type: String,
    },
    'apiTokens.$.hash': {
      type: String,
    },
    'apiTokens.$.name': {
      type: String,
    },
  });

  Meteor.users.attachSchema(schema);
}

function serverSide() {
  attachSchema();
  Accounts.onCreateUser((options, user) => {
    /* eslint-disable no-param-reassign */
    user.organizationID = options.organizationID;

    /* eslint-enable no-param-reassign */
    return user;
  });

  const hyperadmins = [
    'b@unimail.co',
    'jon@unimail.co',
  ];

  Meteor.users.after.insert((id, user) => {
    if (!user.organizationID) {
      Roles.addUsersToRoles(user._id, ['templates.design', 'templates.manage', 'templates.render']);
    }

    if (hyperadmins.includes(user.emails[0].address)) {
      Roles.addUsersToRoles(user._id, ['hyperadmin']);
    }
  });

  Accounts.config({
    sendVerificationEmail: true,
  });


  Meteor.publish('usersForAdmin', function publishUsers() {
    if (Roles.userIsInRole(this.userId, ['hyperadmin'])) {
      return Meteor.users.find({ _id: { $ne: this.userId } });
    }

    return this.ready();
  });

  Meteor.publish('myUser', function publishMyUser() {
    return Meteor.users.find({
      _id: this.userId,
    }, {
      fields: {
        'apiTokens.hash': 0,
      },
    });
  });

  Meteor.publish('users', function publishUsers(passwordToken) {
    check(passwordToken, Match.OneOf(String, undefined));
    if (passwordToken && !this.userId) {
      const users = Meteor.users.find({
        'services.password.reset.token': passwordToken,
      });
      return users;
    } else if (!this.userId) {
      return this.ready();
    }

    const user = Meteor.users.findOne(this.userId);
    if (!user.organizationID) {
      return Meteor.users.find({
        _id: this.userId,
      }, {
        fields: {
          'apiTokens.hash': 0,
        },
      });
    }

    return Meteor.users.find({
      organizationID: user.organizationID,
    }, {
      apiTokens: 0,
    });
  });

  Meteor.publish(null, () => Meteor.roles.find({}));
}

function clientSide() {

}
