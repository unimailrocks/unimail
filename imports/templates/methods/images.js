import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { Templates } from '/imports/templates';

import { userCanSee, userCanDesign } from './permissions';

export const createImage = new ValidatedMethod({
  name: 'templates.body.images.create',
  validate: new SimpleSchema({
    templateID: { type: String, regEx: SimpleSchema.RegEx.Id },
    placement: { type: Object },
    'placement.x': { type: Number },
    'placement.y': { type: Number },
    'placement.width': { type: Number },
    'placement.height': { type: Number },
  }).validator(),
  run({ templateID, placement }) {
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

    if (placement.x + placement.width > template.width) {
      throw new Meteor.Error('Image is hanging off the right edge of the template');
    }

    if (placement.x < 0) {
      throw new Meteor.Error('Image is hanging off the left side of the template');
    }

    if (placement.y < 0) {
      throw new Meteor.Error('Image is hanging off the top of the template');
    }

    const image = {
      placement,
      type: 'image',
      _id: Random.id(),
    };

    Templates.update(templateID, { $push: { items: image } });
  },
});
