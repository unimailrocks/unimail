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
