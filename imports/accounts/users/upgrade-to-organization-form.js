import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { Button, Form, Dimmer, Message, Header, Loader, Modal } from 'semantic-ui-react';

export default class UpgradeToOrganizationForm extends Component {

  state = {
    open: false,
  };

  createOrganization = async e => {
    e.preventDefault();
    const orgName = e.target['new-organization-name'].value;

    await Meteor.callPromise('organizations.create', orgName);
    this.closeModal();
  };

  openModal = () => {
    this.setState(state => ({
      ...state,
      open: true,
    }));
  };

  closeModal = () => {
    this.setState(state => ({
      ...state,
      open: false,
    }));
  }

  render() {
    return (
      <div>
        <Header>
          Upgrade to Organization Account
        </Header>
        <Button onClick={this.openModal}>
          Upgrade
        </Button>
        <Modal size="small" open={this.state.open}>
          <Modal.Header>
            Upgrade to Organization
          </Modal.Header>
          <Modal.Content>
            <Form
              error={!!this.state.error}
              success={!!this.state.validation}
              onSubmit={this.createOrganization}
            >
              <Dimmer active={this.state.waiting} inverted>
                <Loader />
              </Dimmer>
              <Message
                error
                header="Couldn't create organization"
                content={this.state.error}
              />

              <Form.Field>
                <label htmlFor="new-organization-name">Organization Name</label>
                <input
                  name="new-organization-name"
                  id="new-organization-name"
                />
              </Form.Field>
              <Button>
                Create Organization
              </Button>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button onClick={this.closeModal}>
              Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </div>
    );
  }
}
