import { Meteor } from 'meteor/meteor';
import initializeAccounts from '/imports/accounts/initialize';

Meteor.startup(() => {
  initializeAccounts();
});
