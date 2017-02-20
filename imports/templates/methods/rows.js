import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { check } from 'meteor/check';
import Templates, {
  consolidateTemplateContent,
  createTemplateContentDiff,
} from '../collection';
import { userCanDesign, getUserWithRole } from './permissions';

Meteor.methods({
  'templates.rows.update-layout'(templateID, diff) {
    check(templateID, String);
    check(diff, [Object]);

    const user = getUserWithRole(this.userId, 'templates.design');
    const template = Templates.findOne(templateID);
    if (!template || !userCanDesign(template, user)) {
      throw new Meteor.Error('This is not your template.');
    }

    console.log('Change places!!', diff);
    Templates.update(template._id, {
      $push: {
        rowDiffs: diff,
      },
    });
  },
  'templates.rows.create'(templateID) {
    check(templateID, String);

    const user = getUserWithRole(this.userId, 'templates.design');
    const template = Templates.findOne(templateID);
    if (!template || !userCanDesign(template, user)) {
      throw new Meteor.Error('This is not your template.');
    }

    const currentRows = consolidateTemplateContent(template);
    const newRows = currentRows.concat([{
      _id: Random.id(),
      height: 30,
    }]);

    const diff = createTemplateContentDiff(currentRows, newRows);

    return Templates.update(template._id, {
      $push: {
        rowDiffs: diff,
      },
    });
  },
});
