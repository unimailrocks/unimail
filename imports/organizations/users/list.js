import { Meteor } from 'meteor/meteor';
import React, { PropTypes } from 'react';
import { Table, Button } from 'semantic-ui-react';

import { isRole } from '/imports/accounts';
import UnimailPropTypes from '/imports/prop-types';

import EditUserModal from './edit-user-modal';
import DeleteUserModal from './delete-user-modal';

function getRoleName(user) {
  if (isRole(user, 'organizations.admin')) {
    return 'Admin';
  }

  if (isRole(user, 'organizations.manage')) {
    return 'Manager';
  }

  if (isRole(user, 'templates.design') && isRole(user, 'templates.render')) {
    return 'User';
  }

  if (isRole(user, 'templates.design')) {
    return 'Designer';
  }

  if (isRole(user, 'templates.render')) {
    return 'Renderer';
  }

  return 'Observer';
}

function canEditUser(user) {
  if (Meteor.user()._id === user._id) {
    return false;
  }

  if (isRole(Meteor.user(), 'organizations.admin')) {
    return true;
  }

  if (isRole(Meteor.user(), 'organizations.manage') && !isRole(user, 'organizations.admin')) {
    return true;
  }

  return false;
}

function isManager() {
  return isRole(Meteor.user(), 'organizations.admin') || isRole(Meteor.user(), 'organizations.manage');
}

export default function UsersList({ users }) {
  return (
    <Table celled>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Email</Table.HeaderCell>
          <Table.HeaderCell>Role</Table.HeaderCell>
          {
            isManager() ? <Table.HeaderCell /> : null
          }
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {
          users.map(user => (
            <Table.Row key={user._id}>
              <Table.Cell>{user.emails[0].address}</Table.Cell>
              <Table.Cell>{getRoleName(user)}</Table.Cell>
              {
                isManager() ?
                  <Table.Cell collapsing>
                    {
                      canEditUser(user) ? (
                        <Button.Group>
                          <EditUserModal user={user} />
                          <DeleteUserModal user={user} />
                        </Button.Group>
                      ) : null
                    }
                  </Table.Cell> : null
              }
            </Table.Row>
          ))
        }
      </Table.Body>
    </Table>
  );
}

UsersList.propTypes = {
  users: PropTypes.arrayOf(UnimailPropTypes.user).isRequired,
};
