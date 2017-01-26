import React, { PropTypes } from 'react';
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
              <Table.Cell>{user._id}</Table.Cell>
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
    _id: PropTypes.string,
    emails: PropTypes.arrayOf(PropTypes.shape({
      address: PropTypes.string,
      verified: PropTypes.bool,
    })),
  })),
};
