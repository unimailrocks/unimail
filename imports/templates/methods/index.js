import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import Templates from '../collection';

import { userCanDesign } from './permissions';

Meteor.methods({
  'templates.create'(title) {
    check(title, String);
    const user = Meteor.users.findOne(this.userId);
    if (!user) {
      throw new Meteor.Error('Must be signed in to create a template!');
    }

    if (!Roles.userIsInRole(this.userId, 'templates.design')) {
      throw new Meteor.Error('Must have permissions to design templates.');
    }

    if (user.profile.organizationID) {
      return Templates.insert({
        title,
        ownershipType: 'organization',
        ownerID: user.profile.organizationID,
      });
    }

    return Templates.insert({
      title,
      ownershipType: 'user',
      ownerID: this.userId,
    });
  },
  'templates.update'(templateID, updateParams) {
    check(templateID, String);
    check(updateParams, Object);
    const user = Meteor.users.findOne(this.userId);
    if (!user) {
      throw new Meteor.Error('This is not your template.');
    }

    if (!Roles.userIsInRole(this.userId, 'templates.design')) {
      throw new Meteor.Error('Must have permissions to design templates.');
    }

    const template = Templates.findOne(templateID);

    if (!template || !userCanDesign(template, user)) {
      throw new Meteor.Error('This is not your template.');
    }

    return template.update(updateParams);
  },
  'templates.delete'(templateID) {
    check(templateID, String);

    const user = Meteor.users.findOne(this.userId);
    if (!user) {
      throw new Meteor.Error('This is not your template.');
    }

    if (!Roles.userIsInRole(this.userId, 'templates.design')) {
      throw new Meteor.Error('Must have permissions to design templates.');
    }

    const template = Templates.findOne(templateID);

    if (!template || !userCanDesign(template, user)) {
      throw new Meteor.Error('This is not your template.');
    }

    return Templates.remove(template._id);
  },
  'templates.title.edit'(templateID, newTitle) {
    check(templateID, String);
    check(newTitle, String);

    const user = getUserWithRole(this.userId, 'templates.design');

    const template = Templates.findOne(templateID);
    if (!template || !userCanDesign(template, user)) {
      console.log(template, user);
      throw new Meteor.Error('This is not your template.');
    }

    return Templates.update(template._id, { $set: { title: newTitle } });
  },
});

function getUserWithRole(userID, role) {
  const user = Meteor.users.findOne(userID);
  if (!user) {
    throw new Meteor.Error('Must be signed in to access this resource.');
  }

  if (!Roles.userIsInRole(userID, role)) {
    throw new Meteor.Error(`Must have ${role} permissions.`);
  }

  return user;
}

