import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { Form, Checkbox, Button, Modal, Header } from 'semantic-ui-react';

import { isRole } from '/imports/accounts';
import UnimailPropTypes from '/imports/prop-types';

export default class EditUserModal extends Component {
  static propTypes = {
    user: UnimailPropTypes.user.isRequired,
  }

  changePermission = async (e, { value, checked }) => {
    const { user } = this.props;
    e.preventDefault();

    const method = checked ? 'roles.create' : 'roles.delete';
    await Meteor.callPromise(method, user._id, value);
  }

  render() {
    const { user } = this.props;
    return (
      <Modal trigger={<Button icon="edit" color="blue" />}>
        <Modal.Header>
          {user.emails[0].address}
        </Modal.Header>
        <Modal.Content>
          <Form>
            <Header sub>
              Permissions
            </Header>
            <Form.Field>
              <Checkbox
                checked={isRole(user, 'templates.design')}
                label="Design Templates"
                value="templates.design"
                onChange={this.changePermission}
              />
            </Form.Field>
            <Form.Field>
              <Checkbox
                checked={isRole(user, 'templates.render')}
                label="Render Templates"
                value="templates.render"
                onChange={this.changePermission}
              />
            </Form.Field>
            <Form.Field>
              <Checkbox
                checked={isRole(user, 'organizations.manage')}
                label="Manage Organization"
                value="organizations.manage"
                onChange={this.changePermission}
              />
            </Form.Field>
            <Form.Field>
              <Checkbox
                checked={isRole(user, 'organizations.admin')}
                label="Administrate Organization"
                value="organizations.admin"
                onChange={this.changePermission}
              />
            </Form.Field>
          </Form>
        </Modal.Content>
      </Modal>
    );
  }
}
