import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin';
import SimpleSchema from 'simpl-schema';

import { Templates } from '/imports/templates';

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
      throw new Meteor.Error('This emplate does not exist');
    }

    if (!userCanRender(template, user)) {
      throw new Meteor.Error('Must have permissions to render templates');
    }

    // actually render the template
    console.log('rendering', template._id);
  },
});
