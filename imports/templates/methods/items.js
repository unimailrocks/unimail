import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { Templates } from '/imports/templates';
import { rectanglesOverlap, rectangleContains } from '/imports/utils/geometry';

import { userCanSee, userCanDesign } from './permissions';

/**
 * Takes an item and an array of items
 * returns a path and a new placement
 * that corresponds to the container it should belong to
 * (a path being a list of indices into the arrays of children
 * of first the template then the children of the container)
 * and its relative placement.
 * Throws error if there was a positional conflict.
 * existingPath and existingPlacement should only be used recursively
 */
function placeAmongItems(item, items, existingPath = [], existingPlacement = item.placement) {
  // iterate over all items under consideration
  for (let index = 0; index < items.length; index += 1) {
    const i = items[index];
    // if the items overlap
    if (rectanglesOverlap(i.placement, existingPlacement)) {
      if (
        i.type === 'container'
        && rectangleContains(i.placement, existingPlacement)
      ) {
        // and that means "item" is supposed to be inside a container
        if (rectangleContains(i.placement, existingPlacement)) {
          const newPlacement = {
            ...existingPlacement,
            x: existingPlacement.x + i.placement.x,
            y: existingPlacement.y + i.placement.y,
          };
          // recursively call this function for the items
          // inside the container (with a relative position)
          return placeAmongItems(
            item,
            i.details.items,
            [...existingPath, index],
            newPlacement,
          );
        }
      } else {
        // if they overlap but the other item is not a container
        // throw an error, because that's bad
        throw new Meteor.Error('Items overlap!');
      }
    }
  }

  return {
    item: {
      ...item,
      placement: existingPlacement,
    },
    path: existingPath,
  };
}

function constructPrototypeItemDetials(type) {
  switch (type) {
    case 'container':
      return {
        items: [],
      };
    case 'image':
      return {};
    default:
      return null;
  }
}

export const placeItem = new ValidatedMethod({
  name: 'templates.body.items.create',
  validate: new SimpleSchema({
    templateID: { type: String, regEx: SimpleSchema.RegEx.Id },
    item: {
      type: 'Object',
    },
    'item.placement': { type: Object },
    'item.placement.x': { type: Number },
    'item.placement.y': { type: Number },
    'item.placement.width': { type: Number },
    'item.placement.height': { type: Number },
    'item.details': { type: Object, blackbox: true, optional: true },
    'item.type': { type: String },
  }).validator(),
  run({ templateID, item }) {
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

    if (item.placement.x + item.placement.width > template.width) {
      throw new Meteor.Error('Item is hanging off the right edge of the template');
    }

    if (item.placement.x < 0) {
      throw new Meteor.Error('Item is hanging off the left side of the template');
    }

    if (item.placement.y < 0) {
      throw new Meteor.Error('Item is hanging off the top of the template');
    }

    if (item.placement.width < 0 || item.placement.height < 0) {
      throw new Meteor.Error('Item is of negative dimensions');
    }

    const { item: idLessItem, path } = placeAmongItems(item, template.items);

    const arrayPath = path.map(i => `.${i}.details.items`).join('');
    const arrayKey = `items${arrayPath}`;

    const finalItem = {
      ...idLessItem,
      _id: Random.id(),
      details: constructPrototypeItemDetials(idLessItem.type),
    };

    Templates.update(templateID, {
      $push: {
        [arrayKey]: finalItem,
      },
    });
  },
});
