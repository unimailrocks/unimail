import React, { PropTypes } from 'react';
import { Table } from 'semantic-ui-react';

import { isRole } from '/imports/accounts';
import UnimailPropTypes from '/imports/prop-types';

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

export default function UsersList({ users }) {
  return (
    <Table celled>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Email</Table.HeaderCell>
          <Table.HeaderCell>Role</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {
          users.map(user => (
            <Table.Row key={user._id}>
              <Table.Cell>{user.emails[0].address}</Table.Cell>
              <Table.Cell>{getRoleName(user)}</Table.Cell>
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
