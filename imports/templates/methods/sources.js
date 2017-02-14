import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { check, Match } from 'meteor/check';
import Templates from '../collection';
import { userCanDesign, getUserWithRole } from './permissions';

Meteor.methods({
  'templates.sources.create'(templateID, source) {
    check(templateID, String);
    check(source, Match.ObjectIncluding({
      type: String,
      name: Match.Where(name => {
        check(name, String);
        return name.length > 0;
      }),
    }));

    const { type, name } = source;

    const user = getUserWithRole(this.userId, 'templates.design');
    const template = Templates.findOne(templateID);
    if (!template || !userCanDesign(template, user)) {
      throw new Meteor.Error('This is not your template.');
    }

    if (template.sources.find(s => s.name === name)) {
      throw new Meteor.Error('Source must have unique name');
    }

    return Templates.update(template._id, {
      $push: { sources: { type, name, _id: Random.id() } },
    });
  },
  'templates.sources.update'(templateID, source) {
    check(templateID, String);
    check(source, Match.ObjectIncluding({
      type: String,
      name: String,
    }));

    const user = getUserWithRole(this.userId, 'templates.design');
    const template = Templates.findOne(templateID);
    if (!template || !userCanDesign(template, user)) {
      throw new Meteor.Error('This is not your template.');
    }

    const { _id: sourceID, name, type } = source;
    if (name.length === 0) {
      throw new Meteor.Error('Source name cannot be blank');
    }

    const currentSource = template.sources.find(s => s._id === sourceID);
    if (!currentSource) {
      throw new Meteor.Error('This source does not exist.');
    }

    if (currentSource.name === name) {
      return;
    }

    if (template.sources.find(s => s.name === name && s._id !== sourceID)) {
      throw new Meteor.Error('Source must have unique name.');
    }

    Templates.update({
      _id: templateID,
      'sources._id': sourceID,
    }, {
      $set: {
        'sources.$.name': name,
        'sources.$.type': type,
      },
    });
  },
  'templates.sources.delete'(templateID, sourceID) {
    check(templateID, String);
    check(sourceID, String);

    const user = getUserWithRole(this.userId, 'templates.design');
    const template = Templates.findOne(templateID);
    if (!template || !userCanDesign(template, user)) {
      throw new Meteor.Error('This is not your template.');
    }

    const currentSource = template.sources.find(s => s._id === sourceID);
    if (!currentSource) {
      throw new Meteor.Error('This source does not exist.');
    }

    console.log('pulling my leg', template, currentSource);

    Templates.update({
      _id: templateID,
    }, {
      $pull: {
        sources: currentSource,
      },
    });
  },
});
