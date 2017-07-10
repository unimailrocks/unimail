import { Meteor } from 'meteor/meteor';
import { Promise } from 'meteor/promise';
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import randomBytes from 'random-bytes';

export const INTERNAL_TOKEN_NAME = '_-_iNtErNaL_-_';

export const create = new ValidatedMethod({
  name: 'users.apiTokens.create',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    name: { type: String },
  }).validator(),
  run({ name }) { // eslint-disable-line consistent-return
    if (Meteor.isServer) {
      const bcrypt = require('bcrypt'); // eslint-disable-line global-require
      const user = Meteor.users.findOne(this.userId);
      if (!user) {
        throw new Meteor.Error('You must be logged in to create an API token');
      }

      const [keyBuffer, secretBuffer] =
        Promise.await(Promise.all([randomBytes(24), randomBytes(24)]));

      const key = keyBuffer.toString('hex');
      const secret = secretBuffer.toString('hex');

      const hash = Promise.await(bcrypt.hash(secret, 10));

      Meteor.users.update(this.userId, {
        $push: {
          apiTokens: {
            key,
            name,
            hash,
          },
        },
      });

      return { key, secret };
    }
  },
});

export const destroy = new ValidatedMethod({
  name: 'users.apiTokens.destroy',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    key: { type: String },
  }).validator(),
  run({ key }) {
    const user = Meteor.users.findOne(this.userId);
    if (!user) {
      throw new Meteor.Error('You must be logged in to delete an API token');
    }

    const token = user.apiTokens.find(t => t.key === key);
    if (!token) {
      throw new Meteor.Error('Such token does not exist, so we can\'t destroy it');
    }

    Meteor.users.update(this.userId, { $pull: { apiTokens: token } });
  },
});

export function withTemporaryToken(fn) {
  const token = create.call({ name: INTERNAL_TOKEN_NAME });

  try {
    return fn(token);
  } finally {
    destroy.call({ key: token.key });
  }
}
