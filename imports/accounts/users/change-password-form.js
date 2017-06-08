import { Accounts } from 'meteor/accounts-base';
import React, { Component } from 'react';
import { Dimmer, Loader, Form, Message, Button, Header } from 'semantic-ui-react';

export default class ChangePasswordForm extends Component {
  state = {
    error: null,
    validation: null,
    waiting: false,
  };

  changePassword = e => {
    e.preventDefault();
    const currentPassword = this.currentPasswordField.value;
    const newPassword = this.newPasswordField.value;
    const newPasswordConfirmation = this.newPasswordConfirmationField.value;

    if (newPassword !== newPasswordConfirmation) {
      this.setState({
        error: 'Passwords do not match!',
        validation: null,
      });
      return;
    }

    this.setState({
      error: null,
      waiting: true,
    });

    Accounts.changePassword(currentPassword, newPassword, (err) => {
      if (err) {
        this.setState({
          error: err.reason,
          validation: null,
          waiting: false,
        });
      } else {
        this.setState({
          error: null,
          validation: 'Password changed successfully!',
          waiting: false,
        });

        this.currentPasswordField.value = '';
        this.newPasswordField.value = '';
        this.newPasswordConfirmationField.value = '';
      }
    });
  };

  render() {
    return (
      <Form
        error={!!this.state.error}
        success={!!this.state.validation}
        onSubmit={this.changePassword}
      >
        <Header>
          Change Password
        </Header>
        <Dimmer active={this.state.waiting} inverted>
          <Loader />
        </Dimmer>
        <Message
          error
          header="Change Password Failure"
          content={this.state.error}
        />
        <Message
          success
          header="Changed Password!"
          content={this.state.validation}
        />

        <Form.Field>
          <label htmlFor="current-password">Current Password</label>
          <input
            type="password"
            name="current-password"
            ref={r => { this.currentPasswordField = r; }}
          />
        </Form.Field>
        <Form.Field>
          <label htmlFor="new-password">New Password</label>
          <input
            type="password"
            name="new-password"
            ref={r => { this.newPasswordField = r; }}
          />
        </Form.Field>
        <Form.Field>
          <label htmlFor="new-password-confirmation">New Password (confirmation)</label>
          <input
            type="password"
            name="new-password-confirmation"
            ref={r => { this.newPasswordConfirmationField = r; }}
          />
        </Form.Field>

        <Button
          onClick={this.changePassword}
        >
          Change Password
        </Button>
      </Form>
    );
  }
}
