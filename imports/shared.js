import 'babel-polyfill';
import { Meteor } from 'meteor/meteor';
import initializeAccounts from '/imports/accounts/initialize';
import '/imports/accounts';
import '/imports/organizations';
import '/imports/templates';

Meteor.startup(() => {
  initializeAccounts();
});
