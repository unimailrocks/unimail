import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Table } from 'semantic-ui-react';

export default function AdminUsersList({ users }) {
  return (
    <Table celled>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>ID</Table.HeaderCell>
          <Table.HeaderCell>(main) Email</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {
          users.map(user => (
            <Table.Row key={user._id}>
              <Table.Cell><Link to={`/admin/users/${user._id}`}>{user._id}</Link></Table.Cell>
              <Table.Cell>{user.emails[0].address}</Table.Cell>
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
};
