import { Meteor } from 'meteor/meteor';
import { Promise } from 'meteor/promise';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin';
import SimpleSchema from 'simpl-schema';

import { Templates } from '/imports/templates';
import { apiTokens } from '/imports/accounts';

import { userCanSee, userCanRender } from './permissions';

export const createRender = new ValidatedMethod({
  name: 'templates.renders.create',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    templateID: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator(),
  run({ templateID }) {
    if (!this.userId) {
      throw new Meteor.Error('Must be signed in');
    }

    const user = Meteor.users.findOne(this.userId);
    const template = Templates.findOne(templateID);
    if (!userCanSee(template, user)) {
      throw new Meteor.Error('This template does not exist');
    }

    if (!userCanRender(template, user)) {
      throw new Meteor.Error('Must have permissions to render templates');
    }

    if (Meteor.isClient) {
      return;
    }

    const api = require('/server/api'); // eslint-disable-line global-require

    return apiTokens.withTemporaryToken(token =>
      Promise.await(api.renderTemplate(template, token)),
    );
  },
});

export const emailPreview = new ValidatedMethod({
  name: 'templates.renders.email',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    templateID: { type: String, regEx: SimpleSchema.RegEx.Id },
    renderID: { type: String },
  }).validator(),
  run({ templateID, renderID }) {
    if (!this.userId) {
      throw new Meteor.Error('Must be signed in');
    }

    const user = Meteor.users.findOne(this.userId);
    const template = Templates.findOne(templateID);
    if (!userCanSee(template, user)) {
      throw new Meteor.Error('This template does not exist');
    }

    const render = template.renders.find(r => r._id === renderID);

    if (!render) {
      throw new Meteor.Error('This render does not exist');
    }

    if (Meteor.isClient) {
      return;
    }

    const email = require('/server/email'); // eslint-disable-line global-require
    return Promise.await(email.sendEmail({
      to: user.emails[0].address,
      subject: `[Email preview]: ${template.title}`,
      html: render.html,
    }));
  },
});
