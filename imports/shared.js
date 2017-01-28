import { Meteor } from 'meteor/meteor';
import initializeAccounts from '/imports/accounts/initialize';
import '/imports/accounts';

Meteor.startup(() => {
  initializeAccounts();
});
