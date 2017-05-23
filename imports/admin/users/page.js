import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { ReactiveVar } from 'meteor/reactive-var';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Container, Header, Input, Statistic, Segment } from 'semantic-ui-react';
import AdminUsersList from './list';

const searchValue = new ReactiveVar('');

class AdminUsersPage extends Component {
  searchChanged = event => {
    searchValue.set(event.target.value);
  };

  render() {
    return (
      <Container>
        <Segment textAlign="center" basic>
          <Header as="h1">
            Admin users page
          </Header>
          <Statistic>
            <Statistic.Value>{this.props.numUsers}</Statistic.Value>
            <Statistic.Label>Users</Statistic.Label>
          </Statistic>
        </Segment>
        <Segment basic textAlign="right">
          <Input onChange={this.searchChanged} icon="search" placeholder="Search..." />
        </Segment>
        <AdminUsersList users={this.props.users} />
      </Container>
    );
  }
}

AdminUsersPage.propTypes = {
  users: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    emails: PropTypes.arrayOf(PropTypes.shape({
      address: PropTypes.string.isRequired,
      verified: PropTypes.bool.isRequired,
    })).isRequired,
  })).isRequired,
  numUsers: PropTypes.number.isRequired,
};

export default createContainer(() => {
  Meteor.subscribe('usersForAdmin');

  return {
    numUsers: Meteor.users.find().count(),
    users: Meteor.users.find({
      emails: {
        $elemMatch: {
          address: { $regex: searchValue.get() },
        },
      },
    }, {
      limit: 20,
    }).fetch(),
  };
}, AdminUsersPage);
