import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import React, { Component } from 'react';
import { Link } from 'react-router';
import { Sidebar, Segment, Button, Menu, Image, Icon, Header } from 'semantic-ui-react';

function renderUserButton() {
  const user = Meteor.user();
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

function renderAdminButton() {
  const user = Meteor.user();
  if (user && Roles.userIsInRole(user._id, 'hyperadmin')) {
    return (
      <Menu.Item>
        <Link to="/admin">Admin</Link>
      </Menu.Item>
    );
  }

  return null;
}

function renderTemplatesButton() {
  const user = Meteor.user();
  if (user) {
    return (
      <Menu.Item>
        <Link to="/templates">Templates</Link>
      </Menu.Item>
    );
  }

  return null;
}


export default class Head extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
    };
  }

  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  };

  render() {
    return (
      <div>
        <Menu>
          <Menu.Item>
            <Link to="/">Home</Link>
          </Menu.Item>
          {renderUserButton()}
          {renderAdminButton()}
          {renderTemplatesButton()}
        </Menu>
      </div>
    );
  }
}
