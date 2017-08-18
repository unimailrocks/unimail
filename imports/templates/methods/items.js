import get from 'lodash/fp/get';
import reduce from 'lodash/fp/reduce';
import findIndex from 'lodash/fp/findIndex';
import last from 'lodash/fp/last';
import initial from 'lodash/fp/initial';
import isEqual from 'lodash/fp/isEqual';
import fromPairs from 'lodash/fp/fromPairs';
import { Meteor } from 'meteor/meteor';
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin';
import { Random } from 'meteor/random';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { Templates } from '/imports/templates';
import { rectanglesOverlap, rectangleContains } from '/imports/utils/geometry';

import { userCanSee, userCanDesign } from './permissions';

const pathToKey = template => path => path.reduce(({ key, last }, id, pathIndex) => {
  const index = last.details.items.findIndex(({ _id }) => id === _id);
  if (pathIndex === 0) {
    return {
      key: `${key}.${index}`,
      last: last.details.items[index],
    };
  }

  return {
    key: `${key}.details.items.${index}`,
    last: last.details.items[index],
  };
}, { key: 'items', last: { details: template } }).key;

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
    ignoreID,
  } = {},
) {
  const containedElementIndices = [];
  // iterate over all items under consideration
  for (let index = 0; index < items.length; index += 1) {
    const i = items[index];
    if (i._id === ignoreID) {
      continue;
    }

    // check if the items overlap
    if (rectanglesOverlap(i.placement, placement)) {
      // check if existing element is a container that
      // should contain new element
      // skip check if we're already assuming new element
      // will contain siblings of this element
      if (
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
            ignoreID,
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

/**
 * Returns an array of { path, entirelyContained }
 */
export function allOverlappingItemPaths(placement, template) {
  const paths = [];
  const items = template.items.map(item => ({
    item,
    path: [],
    offset: { x: 0, y: 0 },
  }));

  while (items.length > 0) {
    const { item, path, offset } = items.pop();
    const absolutePlacement = {
      ...item.placement,
      x: item.placement.x + offset.x,
      y: item.placement.y + offset.y,
    };

    if (rectanglesOverlap(placement, absolutePlacement)) {
      const newPath = [...path, item._id];
      paths.push({
        path: newPath,
        entirelyContained: rectangleContains(absolutePlacement, placement),
      });

      if (item.details.items) {
        item.details.items.forEach(child => {
          items.push({
            item: child,
            path: newPath,
            offset: {
              x: absolutePlacement.x,
              y: absolutePlacement.y,
            },
          });
        });
      }
    }
  }

  return paths;
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

    const { idPath } = path.reduce(({ idPath, items }, index) => {
      const item = items[index];
      return {
        idPath: [...idPath, item._id],
        items: get('details.items', item),
      };
    }, { idPath: [], items: template.items });

    return {
      item: finalItem,
      path: idPath,
    };
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

    // translate path (_id array) to indices (like [0, 2, 1])
    // also get absolute placement of item
    // (complicated so we can do both in one pass)
    const { indices, absolutePlacement: currentAbsolutePlacement } = reduce(({
      possibleNextItems = template.items,
      indices: currentIndices = [],
      absolutePlacement = { x: 0, y: 0 },
    }, _id) => {
      const newIndex = findIndex({ _id }, possibleNextItems);
      const nextItem = possibleNextItems[newIndex];
      const nextPlacement = nextItem.placement;
      return {
        indices: [...currentIndices, newIndex],
        possibleNextItems: nextItem.details.items,
        absolutePlacement: {
          x: absolutePlacement.x + nextPlacement.x,
          y: absolutePlacement.y + nextPlacement.y,
        },
      };
    }, {}, path);

    const modelKeyPart = indices.join('.details.items.');
    const itemKey = `items.${modelKeyPart}`;
    const item = get(itemKey, template);

    const currentRelativePlacement = item.placement;

    const newAbsolutePlacement = {
      x: (currentAbsolutePlacement.x - currentRelativePlacement.x) + placement.x,
      y: (currentAbsolutePlacement.y - currentRelativePlacement.y) + placement.y,
      width: placement.width,
      height: placement.height,
    };

    if (newAbsolutePlacement.x + newAbsolutePlacement.width > template.width) {
      throw new Meteor.Error('Item is hanging off the right edge of the template');
    }

    if (newAbsolutePlacement.x < 0) {
      throw new Meteor.Error('Item is hanging off the left side of the template');
    }

    if (newAbsolutePlacement.y < 0) {
      throw new Meteor.Error('Item is hanging off the top of the template');
    }

    if (newAbsolutePlacement.width < 0 || newAbsolutePlacement.height < 0) {
      throw new Meteor.Error('Item is of negative dimensions');
    }

    const placed = calculateItemPlacement(
      newAbsolutePlacement,
      template.items,
      // for now, don't allow old elements to go inside the moved item
      // This introduces the complexity of allowing "weaving", which is just
      // not worth implementing for now
      // (that's why we keep outerPossible false)
      { ignoreID: last(path) },
    );

    if (!placed) {
      throw new Meteor.Error('Item overlaps');
    }

    const { placement: relativePlacement, path: newIndices } = placed;
    if (isEqual(newIndices, initial(indices))) {
      const placementKey = `items.${modelKeyPart}.placement`;
      Templates.update(templateID, { $set: { [placementKey]: relativePlacement } });
    } else {
      const newModelParentKeyPart = newIndices.join('.details.items.');
      const newModelParentKey = newModelParentKeyPart.length > 0 ?
        `items.${newModelParentKeyPart}.details.items` :
        'items';


      Templates.update(
        templateID,
        {
          $push: {
            [newModelParentKey]: {
              ...item,
              placement: relativePlacement,
            },
          },
        },
      );

      const modelParentKeyPart = initial(indices).join('.details.items.');
      const modelParentKey = modelParentKeyPart.length > 0 ?
        `items.${modelParentKeyPart}.details.items` :
        'items';

      Templates.update(
        templateID,
        {
          $pull: {
            [modelParentKey]: item,
          },
        },
      );
    }

    const { idPath } = newIndices.reduce(({ idPath, items }, index) => {
      const item = items[index];
      return {
        idPath: [...idPath, item._id],
        items: get('details.items', item),
      };
    }, { idPath: [], items: template.items });

    return {
      item,
      path: [...idPath, item._id],
    };
  },
});

export const resizeItem = new ValidatedMethod({
  name: 'templates.body.items.resize',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    templateID: { type: String, regEx: SimpleSchema.RegEx.Id },
    diff: { type: Object },
    'diff.x': { type: Number },
    'diff.y': { type: Number },
    'diff.width': { type: Number },
    'diff.height': { type: Number },
    path: { type: Array },
    'path.$': { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator(),
  run({ templateID, diff, path }) {
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

    const parentPath = initial(path);
    const id = last(path);
    let parent = { details: template };
    while (parentPath.length > 0) {
      const id = parentPath.shift();
      parent = parent.details.items.find(({ _id }) => _id === id);
    }

    const item = parent.details.items.find(({ _id }) => _id === id);

    const newPlacement = {
      x: item.placement.x + diff.x,
      y: item.placement.y + diff.y,
      width: item.placement.width + diff.width,
      height: item.placement.height + diff.height,
    };

    if (newPlacement.x < 0 || newPlacement.y < 0) {
      throw new Meteor.Error('Invalid resize');
    }

    if (parent.placement) {
      if (newPlacement.x + newPlacement.width > parent.placement.width) {
        throw new Meteor.Error('Invalid resize (goes off right edge of parent)');
      }

      if (newPlacement.y + newPlacement.height > parent.placement.height) {
        throw new Meteor.Error('Invalid resize (goes off bottom of parent)');
      }
    } else if (newPlacement.x + newPlacement.width > template.width) {
      throw new Meteor.Error('Invalid resize (goes off right side of template)');
    }

    const queuedChanges = [
      {
        path,
        newPlacement,
      },
    ];

    if (item.details.items) {
      item.details.items.forEach(child => {
        const childPlacement = {
          ...child.placement,
          x: child.placement.x - diff.x,
          y: child.placement.y - diff.y,
        };

        if (childPlacement.x < 0) {
          throw new Meteor.Error('Invalid resize (squeezes child from left side)');
        }

        if (childPlacement.y < 0) {
          throw new Meteor.Error('Invalid resize (squeezes child from top)');
        }

        if (childPlacement.x + childPlacement.width > newPlacement.width) {
          throw new Meteor.Error('Invalid resize (squeezes child from right side)');
        }

        if (childPlacement.y + childPlacement.height > newPlacement.height) {
          throw new Meteor.Error('Invalid resize (squeezes child from bottom)');
        }

        queuedChanges.push({
          path: [...path, child._id],
          newPlacement: childPlacement,
        });
      });
    }

    const setter = fromPairs(queuedChanges.map(({ path, newPlacement }) => [
      `${pathToKey(template)(path)}.placement`,
      newPlacement,
    ]));

    Templates.update(templateID, { $set: setter });
  },
});

export const destroyItem = new ValidatedMethod({
  name: 'templates.body.items.destroy',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    templateID: { type: String, regEx: SimpleSchema.RegEx.Id },
    path: { type: Array },
    'path.$': { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator(),
  run({ templateID, path }) {
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

    const key = pathToKey(template)(path);
    const arrayKey = initial(key.split('.')).join('.');

    Templates.update(templateID, { $unset: { [key]: '' } });
    Templates.update(templateID, { $pull: { [arrayKey]: null } });
  },
});

