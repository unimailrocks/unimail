import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import { Header, Button, Form, Message } from 'semantic-ui-react';

import UnimailPropTypes from '/imports/prop-types';

export default class EnrollForm extends Component {
  static propTypes = {
    user: UnimailPropTypes.user.isRequired,
    token: PropTypes.string.isRequired,
  };

  state = {
    error: null,
  };


  enroll = async (e) => {
    e.preventDefault();
    const password = this.passwordInput.value;
    const confirmPassword = this.confirmPasswordInput.value;

    if (password !== confirmPassword) {
      this.setState({
        error: 'Passwords do not match',
      });
      return;
    }

    try {
      await Meteor.callPromise('users.enroll', this.props.token, password);
      Meteor.loginWithPassword(this.props.user.emails[0].address, password, err => {
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
    const { user } = this.props;

    return (
      <Form onSubmit={this.register} error={error && error.length > 0}>
        <Message
          error
          header="Enrollment Failure"
          content={error}
        />
        <Form.Field>
          <label htmlFor="email">Email</label>
          <Header.Subheader>{user.emails[0].address}</Header.Subheader>
        </Form.Field>
        <Form.Field>
          <label htmlFor="password">New Password</label>
          <input
            name="password"
            type="password"
            ref={r => { this.passwordInput = r; }}
          />
        </Form.Field>
        <Form.Field>
          <label htmlFor="password">Confirm Password</label>
          <input
            name="password"
            type="password"
            ref={r => { this.confirmPasswordInput = r; }}
          />
        </Form.Field>
        <Button
          color="green"
          onClick={this.enroll}
          fluid
        >
          Enroll
        </Button>
      </Form>
    );
  }
}
