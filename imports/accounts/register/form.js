import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Header, Button, Form, Message } from 'semantic-ui-react';

export default class RegisterForm extends Component {
  state = {
    error: null,
  };

  register = async (e) => {
    e.preventDefault();
    const email = this.emailInput.value;
    const password = this.passwordInput.value;

    try {
      await Meteor.callPromise('users.create', email, password);
      Meteor.loginWithPassword(email, password, err => {
        if (err) {
          this.setState({
            error: err.reason,
          });
        }
      });
    } catch (err) {
      this.setState({
        error: err.reason,
      });
    }
  }

  render() {
    const { error } = this.state;

    return (
      <Form onSubmit={this.register} error={error && error.length > 0}>
        <Header>
          Register for Unimail
        </Header>
        <Message
          error
          header="Registration Failure"
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
          onClick={this.register}
          fluid
        >
          Register
        </Button>
        <Button
          as={Link}
          to="/login"
          color="grey"
          fluid
        >
          Log in
        </Button>

      </Form>
    );
  }
}
