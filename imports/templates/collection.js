import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Templates = new Mongo.Collection('templates');
Templates.attachSchema(new SimpleSchema({
  title: {
    type: String,
  },
  ownershipType: {
    type: String,
    allowedValues: ['user', 'organization'],
  },
  ownerID: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  editors: {
    type: Array,
    optional: true,
  },
  'editors.$': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  viewers: {
    type: Array,
    optional: true,
  },
  'viewers.$': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  sources: {
    // TODO figure out why Array doesn't work here
    type: Object,
    blackbox: true,
    defaultValue: [],
  },
  'sources.$._id': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  'sources.$.name': {
    type: String,
  },
  'sources.$.type': {
    type: String,
    allowedValues: [
      'webpage',
      'text',
    ],
  },
  'sources.$.identifier': {
    type: String,
    optional: true,
  },
}));

export default Templates;

if (Meteor.isServer) {
  Meteor.publish('templates', function publishTemplates() {
    if (!this.userId) {
      return this.ready();
    }

    const user = Meteor.users.findOne(this.userId);
    if (user.profile.organizationID) {
      return Templates.find({
        ownershipType: 'organization',
        ownerID: user.profile.organizationID,
      });
    }

    return Templates.find({
      ownershipType: 'user',
      ownerID: this.userId,
    });
  });
}
