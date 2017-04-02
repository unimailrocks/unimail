import React, { PropTypes } from 'react';
import { Container, Header } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

export default function AdminIndex({ match }) {
  return (
    <Container>
      <Header>
        <Link to={`${match.url}/users`}>Users List</Link>
      </Header>
      <Header>
        <Link to={`${match.url}/organizations`}>Organizations</Link>
      </Header>
    </Container>
  );
}

AdminIndex.propTypes = {
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
  }).isRequired,
};
