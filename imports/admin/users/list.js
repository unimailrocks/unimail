import { Roles } from 'meteor/alanning:roles';
import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Table } from 'semantic-ui-react';

export default function AdminUsersList({ users, fields }) {
  const headers = [
    ['id', <Table.HeaderCell key="id">ID</Table.HeaderCell>],
    ['email', <Table.HeaderCell key="email">(main) Email</Table.HeaderCell>],
    ['organization', <Table.HeaderCell key="organization">Organization ID</Table.HeaderCell>],
    ['roles', <Table.HeaderCell key="roles">Roles</Table.HeaderCell>],
  ];

  const cells = user => [
    [
      'id',
      <Table.Cell key="id"><Link to={`/admin/users/${user._id}`}>{user._id}</Link></Table.Cell>,
    ],
    [
      'email',
      <Table.Cell key="email">{user.emails[0].address}</Table.Cell>,
    ],
    [
      'organization',
      <Table.Cell key="organization">
        <Link to={`/admin/organizations/${user.organizationID}`}>{user.organizationID}</Link>
      </Table.Cell>,
    ],
    [
      'roles',
      <Table.Cell key="roles">
        {Roles.getRolesForUser(user)}
      </Table.Cell>,
    ],
  ];

  // filters headers for fields
  // and extracts element from associative array
  function renderHeaders() {
    return headers
      .filter(([key]) => fields.includes(key))
      .map(([, element]) => element);
  }

  // filters cells for fields
  // and extracts element from associative array
  function renderCells(user) {
    return cells(user)
      .filter(([key]) => fields.includes(key))
      .map(([, element]) => element);
  }

  return (
    <Table celled>
      <Table.Header>
        <Table.Row>
          {renderHeaders()}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {
          users.map(user => (
            <Table.Row key={user._id}>
              {renderCells(user)}
            </Table.Row>
          ))
        }
      </Table.Body>
    </Table>
  );
}

AdminUsersList.propTypes = {
  users: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    emails: PropTypes.arrayOf(PropTypes.shape({
      address: PropTypes.string.isRequired,
      verified: PropTypes.bool.isRequired,
    })).isRequired,
  })).isRequired,
  fields: PropTypes.arrayOf(PropTypes.string),
};

AdminUsersList.defaultProps = {
  fields: ['id', 'email', 'organization', 'roles'],
};
