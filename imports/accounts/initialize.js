/* globals Accounts, Roles */
import { Meteor } from 'meteor/meteor';

export default function initializeAccounts() {
  Accounts.ui.config({
    passwordSignupFields: 'EMAIL_ONLY',
  });

  if (Meteor.isServer) {
    serverSide();
  } else {
    clientSide();
  }
}

function serverSide() {
  const user = Accounts.findUserByEmail('ben.m.berman@gmail.com');
  if (user) {
    Roles.addUsersToRoles(user._id, ['hyperadmin']);
  }

  Meteor.publish('usersForAdmin', function publishUsers() {
    if (Roles.userIsInRole(this.userId, ['hyperadmin'])) {
      return Meteor.users.find({});
    }

    return this.ready();
  });
}

function clientSide() {

}
