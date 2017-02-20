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

const RowSchema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  height: {
    type: Number,
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
  rows: {
    type: Array,
    defaultValue: [],
  },
  'rows.$': {
    type: RowSchema,
  },
  rowDiffs: {
    type: Array,
    defaultValue: [],
  },
  'rowDiffs.$': {
    type: Array,
  },
  'rowDiffs.$.$': {
    type: Object,
    blackbox: true,
  },
}));

export default Templates;

export function consolidateTemplateContent(template) {
  const rows = cloneDeep(template.rows);
  const diffs = template.rowDiffs;

  diffs.forEach(d => {
    d.forEach(change => {
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
