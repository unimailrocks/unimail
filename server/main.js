import { Meteor } from 'meteor/meteor';
import { share } from '/imports/shared-env-variables';
import '/imports/shared';

Meteor.startup(() => {
  share('UNIMAIL_API_URL');
});
