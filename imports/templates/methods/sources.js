import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { check, Match } from 'meteor/check';
import Templates from '../collection';
import { userCanSee, userCanDesign } from './permissions';

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

    if (!this.userId) {
      throw new Meteor.Error('Must be signed in');
    }

    const user = Meteor.users.findOne(this.userId);
    const template = Templates.findOne(templateID);

    if (!userCanSee(template, user)) {
      throw new Meteor.Error('This template does not exist');
    }

    if (!userCanDesign(template, user)) {
      throw new Meteor.Error('You don\'t have permissions to design this template');
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

    if (!this.userId) {
      throw new Meteor.Error('Must be signed in');
    }

    const user = Meteor.users.findOne(this.userId);
    const template = Templates.findOne(templateID);
    if (!userCanSee(template, user)) {
      throw new Meteor.Error('This template does not exist');
    }

    if (!userCanDesign(template, user)) {
      throw new Meteor.Error('You don\'t have permissions to design this template');
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

    if (!this.userId) {
      throw new Meteor.Error('Must be signed in');
    }

    const user = Meteor.users.findOne(this.userId);
    const template = Templates.findOne(templateID);
    if (!userCanSee(template, user)) {
      throw new Meteor.Error('This template does not exist');
    }

    if (!userCanDesign(template, user)) {
      throw new Meteor.Error('You don\'t have permissions to design this template');
    }

    const currentSource = template.sources.find(s => s._id === sourceID);
    if (!currentSource) {
      throw new Meteor.Error('This source does not exist.');
    }

    Templates.update({
      _id: templateID,
    }, {
      $pull: {
        sources: currentSource,
      },
    });
  },
});
