import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import cloneDeep from 'lodash/fp/cloneDeep';
import diff from 'deep-diff';

const Templates = new Mongo.Collection('templates');

const SourceSchema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  name: {
    type: String,
  },
  type: {
    type: String,
    allowedValues: ['webpage', 'text'],
  },
});

const ItemSchema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  placement: {
    type: Object,
  },
  'placement.x': {
    type: Number,
  },
  'placement.y': {
    type: Number,
  },
  'placement.width': {
    type: Number,
  },
  'placement.height': {
    type: Number,
  },
  type: {
    type: String,
    allowedValues: ['image'],
  },
});

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
  managers: {
    type: Array,
    optional: true,
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
    type: Array,
    defaultValue: [],
  },
  'sources.$': {
    type: SourceSchema,
  },
  items: {
    type: Array,
    defaultValue: [],
  },
  'items.$': {
    type: ItemSchema,
  },
  width: {
    type: Number,
    // Spooky magic number wonder what it means
    defaultValue: 598,
  },
}));

export default Templates;

export function consolidateTemplateContent(template) {
  const rows = cloneDeep(template.rows);
  const diffs = template.rowDiffs;

  diffs.forEach((d) => {
    d.forEach((change) => {
      diff.applyChange(rows, true, change);
    });
  });

  return rows;
}

export function createTemplateContentDiff(oldRows, newRows) {
  return diff.diff(oldRows, newRows);
}

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
