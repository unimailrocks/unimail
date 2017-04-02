import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { Roles } from 'meteor/alanning:roles';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Icon } from 'semantic-ui-react';

import UnimailPropTypes from '/imports/prop-types';
import { Organizations } from '/imports/organizations';

class Head extends Component {
  static propTypes = {
    user: UnimailPropTypes.user,
    organization: UnimailPropTypes.organization,
  }

  static defaultProps = {
    user: null,
    organization: null,
  }

  constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
    };
  }

  logOut = () => {
    Meteor.logout(err => {
      if (err) {
        alert('Some error occurred while logging out. We didn\'t even know that was possible. Please contact support and let us know how this happened');
      }
    });
  }

  renderUserButton = () => {
    const { user } = this.props;
    if (!user) {
      return (
        <Menu.Item>
          <Link to="/login">Log In</Link>
        </Menu.Item>
      );
    }

    return (
      <Menu.Item>
        <Link to="/me">{user.emails[0].address}</Link>
      </Menu.Item>
    );
  }

  renderAdminButton = () => {
    const { user } = this.props;
    if (user && Roles.userIsInRole(user._id, 'hyperadmin')) {
      return (
        <Menu.Item>
          <Link to="/admin">Admin</Link>
        </Menu.Item>
      );
    }

    return null;
  }

  renderTemplatesButton = () => {
    const { user } = this.props;
    if (user) {
      return (
        <Menu.Item>
          <Link to="/templates">Templates</Link>
        </Menu.Item>
      );
    }

    return null;
  }

  renderOrganizationButton = () => {
    const { organization } = this.props;
    if (organization) {
      return (
        <Menu.Item>
          <Link to="/organization">{organization.name}</Link>
        </Menu.Item>
      );
    }

    return null;
  }

  renderLogoutButton = () => {
    const { user } = this.props;
    if (user) {
      return (
        <Menu.Item onClick={this.logOut}>
          <Icon name="log out" />
        </Menu.Item>
      );
    }

    return null;
  }

  render() {
    return (
      <div>
        <Menu secondary>
          <Menu.Item>
            <Link to="/">Home</Link>
          </Menu.Item>
          {this.renderUserButton()}
          {this.renderAdminButton()}
          {this.renderTemplatesButton()}
          {this.renderOrganizationButton()}
          <Menu.Menu position="right">
            {this.renderLogoutButton()}
          </Menu.Menu>
        </Menu>
      </div>
    );
  }
}

export default createContainer(() => {
  Meteor.subscribe('organizations');

  return {
    organization: Meteor.user() && Organizations.findOne({
      _id: Meteor.user().organizationID,
    }),
    user: Meteor.user(),
  };
}, Head);
