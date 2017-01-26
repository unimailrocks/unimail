import React, { Component } from 'react';
import { Link } from 'react-router';
import { Sidebar, Segment, Button, Menu, Image, Icon, Header } from 'semantic-ui-react';

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
          <Menu.Item>
            <Link to="/login">Log In</Link>
          </Menu.Item>
        </Menu>
      </div>
    );
  }
}
