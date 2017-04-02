import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Header, Button, Form, Message } from 'semantic-ui-react';

export default class LoginForm extends Component {
  state = {
    error: null,
  };

  login = (e) => {
    e.preventDefault();
    const email = this.emailInput.value;
    const password = this.passwordInput.value;

    Meteor.loginWithPassword(email, password, err => {
      if (err) {
        this.setState({
          error: err.reason,
        });
      }
    });
  }

  render() {
    const { error } = this.state;

    return (
      <Form onSubmit={this.login} error={error && error.length > 0}>
        <Header>
          Log in
        </Header>
        <Message
          error
          header="Login Failure"
          content={error}
        />
        <Form.Field>
          <label htmlFor="email">Email</label>
          <input
            name="email"
            type="email"
            ref={r => { this.emailInput = r; }}
          />
        </Form.Field>
        <Form.Field>
          <label htmlFor="password">Password</label>
          <input
            name="password"
            type="password"
            ref={r => { this.passwordInput = r; }}
          />
        </Form.Field>
        <Button
          color="green"
          onClick={this.login}
          fluid
        >
          Log in
        </Button>
        <Button
          as={Link}
          to="/register"
          color="grey"
          fluid
        >
          Register
        </Button>

      </Form>
    );
  }
}
