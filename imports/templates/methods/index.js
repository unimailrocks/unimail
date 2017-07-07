import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { isRole } from '/imports/accounts';
import Templates from '../collection';

import { userCanDesign, userCanSee } from './permissions';
import './sources';

import * as Items from './items';
import * as Renders from './renders';

export { Items, Renders };

Meteor.methods({
  'templates.create'(title) {
    check(title, String);
    if (!this.userId) {
      throw new Meteor.Error('Must be signed in');
    }

    const user = Meteor.users.findOne(this.userId);

    if (!isRole(user, 'templates.design')) {
      throw new Meteor.Error('Must have permissions to design templates');
    }

    if (user.organizationID) {
      return Templates.insert({
        title,
        ownershipType: 'organization',
        ownerID: user.organizationID,
        items: [],
      });
    }

    return Templates.insert({
      title,
      ownershipType: 'user',
      ownerID: this.userId,
      items: [],
    });
  },
  'templates.delete'(templateID) {
    check(templateID, String);

    if (!this.userId) {
      throw new Meteor.Error('Must be signed in');
    }

    const user = Meteor.users.findOne(this.userId);
    const template = Templates.findOne(templateID);

    if (!userCanSee(template, user)) {
      throw new Meteor.Error('This template does not exist');
    }

    if (!userCanDesign(template, user)) {
      throw new Meteor.Error('You don\'t have permissions to delete this template');
    }

    return Templates.remove(template._id);
  },
  'templates.title.edit'(templateID, newTitle) {
    check(templateID, String);
    check(newTitle, String);

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

    return Templates.update(template._id, { $set: { title: newTitle } });
  },
});
