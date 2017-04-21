import get from 'lodash/fp/get';
import reduce from 'lodash/fp/reduce';
import findIndex from 'lodash/fp/findIndex';
import last from 'lodash/fp/last';
import { Meteor } from 'meteor/meteor';
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin';
import { Random } from 'meteor/random';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { Templates } from '/imports/templates';
import { rectanglesOverlap, rectangleContains } from '/imports/utils/geometry';

import { userCanSee, userCanDesign } from './permissions';

/**
 * Takes a placement and an array of items
 * returns a path and a new placement
 * that corresponds to the container it should belong to
 * (a path being a list of indices into the arrays of children
 * of first the template then the children of the container)
 * and its relative placement.
 *
 * returns false if there's a positional conflict
 */
export function calculateItemPlacement(
  placement,
  items,
  {
    existingPath = [],
    outerPossible = false,
    innerPossible = true,
  } = {},
) {
  const containedElementIndices = [];
  // iterate over all items under consideration
  for (let index = 0; index < items.length; index += 1) {
    const i = items[index];
    // check if the items overlap
    if (rectanglesOverlap(i.placement, placement)) {
      // check if existing element is a container that
      // should contain new element
      // skip check if we're already assuming new element
      // will contain siblings of this element
      if (
        innerPossible &&
        containedElementIndices.length === 0 &&
        i.type === 'container'
        && rectangleContains(i.placement, placement)
      ) {
        // and that means "item" is supposed to be inside a container
        const newPlacement = {
          ...placement,
          x: placement.x - i.placement.x,
          y: placement.y - i.placement.y,
        };
        // recursively call this function for the items
        // inside the container (with a relative placement)
        return calculateItemPlacement(
          newPlacement,
          i.details.items,
          {
            existingPath: [...existingPath, index],
            outerPossible,
          },
        );
      // maybe new element goes *around* the existing element
      } else if (outerPossible && rectangleContains(placement, i.placement)) {
        // if so, mark inner element as "to be contained"
        containedElementIndices.push(index);
      } else {
        // the placement must be invalid (overlaps but no
        // proper containment configuration)
        return false;
      }
    }
  }

  return {
    placement,
    path: existingPath,
    toBeContained: containedElementIndices.length === 0 ? undefined : containedElementIndices,
  };
}

function constructPrototypeItemDetails(type) {
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
  mixins: [CallPromiseMixin],
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

    const placed = calculateItemPlacement(
      item.placement,
      template.items,
      {
        outerPossible: item.type === 'container',
      },
    );
    if (!placed) {
      throw new Meteor.Error('Item overlaps');
    }

    const { placement, path, toBeContained } = placed;

    const arrayPath = path.map(i => `.${i}.details.items`).join('');
    const arrayKey = `items${arrayPath}`;

    let children = [];
    let oldChildKeys = [];
    // there are some existing elements
    // that should be moved into the new element
    if (toBeContained && item.type === 'container') {
      oldChildKeys = toBeContained.map(idx => `${arrayKey}.${idx}`);
      children = oldChildKeys.map(key => {
        const originalChild = get(key, template);
        // convert child placement to relative placement to new container
        return {
          ...originalChild,
          placement: {
            ...originalChild.placement,
            x: originalChild.placement.x - placement.x,
            y: originalChild.placement.y - placement.y,
          },
        };
      });
    }

    const idLessItem = {
      ...item,
      placement,
    };

    const _id = Random.id();

    const details = item.type === 'container' ?
      { items: children } : constructPrototypeItemDetails(idLessItem.type);

    const finalItem = {
      ...idLessItem,
      _id,
      details,
    };

    const unsetObject = oldChildKeys.reduce((currObj, key) => ({
      ...currObj,
      [key]: 1,
    }), {});

    // set all to-be-deleted children to null
    Templates.update(templateID, {
      $unset: unsetObject,
    });

    // cull the nulls
    Templates.update(templateID, { $pull: { [arrayKey]: null } });

    // add the new item
    Templates.update(templateID, {
      $push: {
        [arrayKey]: finalItem,
      },
    });
  },
});

export const moveItem = new ValidatedMethod({
  name: 'templates.body.items.move',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    templateID: { type: String, regEx: SimpleSchema.RegEx.Id },
    placement: { type: Object },
    'placement.x': { type: Number },
    'placement.y': { type: Number },
    'placement.width': { type: Number },
    'placement.height': { type: Number },
    path: { type: Array },
    'path.$': { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator(),
  run({ templateID, placement, path }) {
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
      throw new Meteor.Error('Item is hanging off the right edge of the template');
    }

    if (placement.x < 0) {
      throw new Meteor.Error('Item is hanging off the left side of the template');
    }

    if (placement.y < 0) {
      throw new Meteor.Error('Item is hanging off the top of the template');
    }

    if (placement.width < 0 || placement.height < 0) {
      throw new Meteor.Error('Item is of negative dimensions');
    }

    const { indices, siblings } = reduce(({ possibleNextItems, indices: currentIndices }, _id) => {
      const newIndex = findIndex({ _id }, possibleNextItems);
      return {
        indices: [...currentIndices, newIndex],
        possibleNextItems: possibleNextItems[newIndex].details.items,
        siblings: possibleNextItems,
      };
    }, { possibleNextItems: template.items, indices: [] }, path);


    const placed = calculateItemPlacement(
      placement,
      siblings.filter(({ _id }) => _id !== last(path)),
      { innerPossible: false },
    );

    if (!placed) {
      throw new Meteor.Error('Item overlaps');
    }

    const modelPath = indices.join('.details.items.');
    const modelKey = `items.${modelPath}.placement`;
    Templates.update(templateID, { $set: { [modelKey]: placement } });
  },
});
