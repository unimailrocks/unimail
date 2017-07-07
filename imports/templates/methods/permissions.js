import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { isRole } from '/imports/accounts';
import Templates from '../collection';

Meteor.methods({
  'templates.editors.update'(templateID, editorIDs) {
    check(templateID, String);
    check(editorIDs, [String]);

    const user = Meteor.users.findOne(this.userId);
    if (!user) {
      throw new Meteor.Error('Must be signed in');
    }

    if (!isRole(this.userId, 'templates.manage')) {
      throw new Meteor.Error('Must have permissions to manage templates');
    }

    const template = Templates.findOne(templateID);

    if (!userCanSee(template, user)) {
      throw new Meteor.Error('Template does not exist');
    }

    Templates.update(templateID, { $set: { editors: editorIDs } });
  },
  'templates.viewers.update'(templateID, viewerIDs) {
    check(templateID, String);
    check(viewerIDs, [String]);

    const user = Meteor.users.findOne(this.userId);
    if (!user) {
      throw new Meteor.Error('Must be signed in');
    }

    if (!isRole(this.userId, 'templates.manage')) {
      throw new Meteor.Error('Must have permissions to manage templates');
    }

    const template = Templates.findOne(templateID);

    if (!userCanSee(template, user)) {
      throw new Meteor.Error('This template does not exist');
    }

    Templates.update(templateID, { $set: { viewers: viewerIDs } });
  },
});

export function userHas(template, user) {
  if (template.ownershipType === 'organization' && template.ownerID === user.organizationID) {
    return true;
  }

  if (template.ownershipType === 'user' && template.ownerID === user._id) {
    return true;
  }

  return false;
}

export function userCanDesign(template, user) {
  if (!userCanSee(template, user)) {
    return false;
  }

  if (template.editors && template.editors.includes(user._id)) {
    return true;
  }

  if (!isRole(user, 'templates.design')) {
    return false;
  }

  return userHas(template, user);
}

// Can user know it exists?
export function userCanSee(template, user) {
  if (!template) {
    return false;
  }

  return userHas(template, user);
}

export function userCanRender(template, user) {
  if (!userCanSee(template, user)) {
    return false;
  }

  if (!isRole(user, 'templates.render')) {
    return false;
  }

  return userHas(template, user);
}
