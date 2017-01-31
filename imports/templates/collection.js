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
    regEx: SimpleSchema.RegEx.id,
  },
}));

export default Templates;

if (Meteor.isServer) {
  Meteor.publish('templates', function publishTemplates() {
    if (!this.userId) {
      return this.ready();
    }

    const user = Meteor.users.findOne(this.userId);
    if (user.organizationID) {
      return Templates.find({
        ownershipType: 'organization',
        ownerID: user.organizationID,
      });
    }

    return Templates.find({
      ownershipType: 'user',
      ownerID: this.userId,
    });
  });
}
