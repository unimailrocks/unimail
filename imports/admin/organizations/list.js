import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Table } from 'semantic-ui-react';

export default function AdminOrganizationsList({ organizations }) {
  return (
    <Table celled>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>ID</Table.HeaderCell>
          <Table.HeaderCell>Name</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {
          organizations.map(organization => (
            <Table.Row key={organization._id}>
              <Table.Cell><Link to={`/admin/organizations/${organization._id}`}>{organization._id}</Link></Table.Cell>
              <Table.Cell>{organization.name}</Table.Cell>
            </Table.Row>
          ))
        }
      </Table.Body>
    </Table>
  );
}

AdminOrganizationsList.propTypes = {
  organizations: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
};
