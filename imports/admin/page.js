import React, { Component, PropTypes } from 'react';
import { browserHistory } from 'react-router';
import { resolveUser, isRole } from '/imports/accounts';

export default class AdminPage extends Component {
  state = {
    authorized: false,
  }

  async componentDidMount() {
    const user = await resolveUser();
    if (!isRole(user, 'hyperadmin')) {
      browserHistory.push('/');
    } else {
      this.setState({
        authorized: true,
      });
    }
  }

  render() {
    if (!this.state.authorized) {
      return <div></div>;
    }

    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}

AdminPage.propTypes = {
  children: PropTypes.element.isRequired,
};
