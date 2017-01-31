import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import Templates from './collection';

function userCanDesign(template, user) {
  if (template.editors && template.editors.includes(user._id)) {
    return true;
  }

  if (template.ownershipType === 'organization' && template.ownerID === user.organizationID) {
    return true;
  }

  if (template.ownershipType === 'user' && template.ownerID === user._id) {
    return true;
  }

  return false;
}

Meteor.methods({
  'templates.create'(title) {
    check(title, String);
    const user = Meteor.users.findOne(this.userId);
    if (!user) {
      throw new Meteor.Error('Must be signed in to create a template!');
    }

    if (!Roles.userIsInRole(this.userId, 'templates.design')) {
      throw new Meteor.Error('Must have permissions to create templates');
    }

    if (user.organizationID) {
      return Templates.insert({
        title,
        ownershipType: 'organization',
        ownerID: user.organizationID,
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
      throw new Meteor.Error('Must have permissions to design templates');
    }

    const template = Templates.findOne(templateID);

    if (!template || !userCanDesign(template, user)) {
      throw new Meteor.Error('This is not your template.');
    }

    return template.update(updateParams);
  },
});
