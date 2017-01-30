import React, { Component, PropTypes } from 'react';
import { browserHistory, Link } from 'react-router';
import { Container, Header } from 'semantic-ui-react';
import { resolveUser, isRole } from '/imports/accounts';

export default class AdminPage extends Component {
  state = {
    authorized: false,
  }

  async componentWillMount() {
    const user = await resolveUser();
    if (!isRole(user, 'hyperadmin')) {
      console.log('redirecting!!!', user);
      browserHistory.push('/');
    } else {
      this.setState({
        authorized: true,
      });
    }
  }

  render() {
    if (!this.state.authorized) {
      return <div />;
    }

    if (this.props.children) {
      return (
        <div>
          {this.props.children}
        </div>
      );
    }

    return (
      <Container>
        <Header>
          <Link to="/admin/users">Users List</Link>
        </Header>
        <Header>
          <Link to="/admin/organizations">Organizations</Link>
        </Header>
      </Container>
    );
  }
}

AdminPage.propTypes = {
  children: PropTypes.element, // eslint-disable-line
};
