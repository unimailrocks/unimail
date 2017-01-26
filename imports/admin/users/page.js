import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { ReactiveVar } from 'meteor/reactive-var';
import React, { Component, PropTypes } from 'react';
import AdminUsersList from './list';

class AdminUsersPage extends Component {
  render() {
    console.log(this.props);
    return (
      <div>
        Admin users page
        <AdminUsersList users={this.props.users} />
      </div>
    );
  }
}

AdminUsersPage.propTypes = {
  users: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string,
    emails: PropTypes.arrayOf(PropTypes.shape({
      address: PropTypes.string,
      verified: PropTypes.bool,
    })),
  })),
};

export default createContainer(() => {
  Meteor.subscribe('usersForAdmin');

  return {
    users: Meteor.users.find({}).fetch(),
  };
}, AdminUsersPage);
