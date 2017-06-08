import truncate from 'lodash/fp/truncate';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import {
  ButtonGroup,
  Button,
  Dimmer,
  Icon,
  Loader,
  Modal,
  Message,
  Form,
  Header,
  Table,
} from 'semantic-ui-react';
import Copyable from '/imports/components/copyable';
import UnimailPropTypes from '/imports/prop-types';
import * as users from '/imports/accounts';

class APITokensList extends Component {
  static propTypes = {
    user: UnimailPropTypes.user.isRequired,
  }

  static get tokenNameInputId() {
    return 'token-name';
  }

  state = {
    modals: {
      create: {
        open: false,
        pending: false,
      },
      destroy: {
        open: false,
        pending: false,
      },
    },
  }

  setCreateModalState = newState => () => {
    this.setState(state => ({
      modals: {
        ...state.modals,
        create: {
          ...state.modals.create,
          ...newState,
        },
      },
    }));
  }

  setDestroyModalState = newState => () => {
    this.setState(state => ({
      modals: {
        ...state.modals,
        destroy: {
          ...state.modals.destroy,
          ...newState,
        },
      },
    }));
  }

  createAPIToken = async e => {
    e.preventDefault();
    const form = e.target;

    const tokenName = form[this.constructor.tokenNameInputId].value;

    this.setCreateModalState({ pending: true })();
    const { secret, key } = await users.apiTokens.create.callPromise({ name: tokenName });
    this.setCreateModalState({
      pending: false,
      secret,
      key,
    })();
  }

  destroyAPIToken = key => async e => {
    e.preventDefault();
    this.setDestroyModalState({ pending: true })();
    await users.apiTokens.destroy.callPromise({ key });
    this.setDestroyModalState({ pending: false, success: true })();
  }

  renderCreateModalContent() {
    const modalState = this.state.modals.create;
    const { tokenNameInputId } = this.constructor;
    if (modalState.pending) {
      return (
        <Dimmer active inverted>
          <Loader />
        </Dimmer>
      );
    }

    if (modalState.secret && modalState.key) {
      return (
        <div>
          <Header>Your new API Token</Header>

          <p>This is the API token <code>key</code> and <code>secret</code></p>
          <p>
            <strong>
              Once you close this modal, you will not be able to retrieve
              the <code>secret</code> again. Make sure to save it now!
            </strong>
          </p>
          <Header.Subheader>
            API Token Key:
          </Header.Subheader>
          <Copyable text={modalState.key} />
          <Header.Subheader>
            API Token Secret:
          </Header.Subheader>
          <Copyable text={modalState.secret} />
        </div>
      );
    }

    return (
      <Form onSubmit={this.createAPIToken} >
        <Dimmer active={modalState.waiting} inverted>
          <Loader />
        </Dimmer>
        <Message
          error
          header="Couldn't create API Token"
          content={modalState.error}
        />

        <Form.Field>
          <label htmlFor={tokenNameInputId}>Token name (optional, but recommended)</label>
          <input
            name={tokenNameInputId}
            id={tokenNameInputId}
          />
        </Form.Field>
        <Button>
          Create Token
        </Button>
      </Form>
    );
  }

  renderCreateModal() {
    const modalState = this.state.modals.create;
    return (
      <Modal size="small" open={modalState.open}>
        <Modal.Header>
          Create API Token
        </Modal.Header>
        <Modal.Content>
          {this.renderCreateModalContent()}
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={this.setCreateModalState({ open: false, key: null, secret: null })}>
            {modalState.key ? 'Done' : 'Cancel'}
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }

  renderDestroyModalContent() {
    const modalState = this.state.modals.destroy;
    if (modalState.pending) {
      return (
        <Dimmer active>
          <Loader />
        </Dimmer>
      );
    }

    if (modalState.success) {
      return (
        <Header as="h2" icon textAlign="center" inverted>
          <Icon name="checkmark" color="green" />
          API Token deleted
        </Header>
      );
    }

    return (
      <div>
        <Header as="h3" inverted>
          Are you sure you want to do this?
        </Header>
        <p>Once a token has been deleted, it cannot be undeleted, and all applications that use
        this token will have their permissions revoked until their token is updated.</p>
      </div>
    );
  }

  renderDestroyModal() {
    const modalState = this.state.modals.destroy;

    const actions = modalState.success ? (
      <Button
        inverted
        color="grey"
        onClick={this.setDestroyModalState({ open: false, success: false, key: null })}
      >
        Okay
      </Button>
    ) : [
      <Button
        inverted
        color="red"
        icon="trash"
        onClick={this.destroyAPIToken(modalState.key)}
        content="Delete"
        key="Delete"
      />,
      <Button
        inverted
        color="grey"
        onClick={this.setDestroyModalState({ open: false, success: false, key: null })}
        key="Cancel"
      >
        Cancel
      </Button>,
    ];

    return (
      <Modal size="small" open={modalState.open} basic>
        <Modal.Header>
          Delete API Token
        </Modal.Header>
        <Modal.Content>
          {this.renderDestroyModalContent()}
        </Modal.Content>
        <Modal.Actions>
          {actions}
        </Modal.Actions>
      </Modal>
    );
  }

  renderTable() {
    const { apiTokens = [] } = this.props.user;
    const rows = apiTokens.length === 0 ? (
      <Table.Row warning>
        <Table.Cell colSpan={3}>
          You have no active API tokens at the moment
        </Table.Cell>
      </Table.Row>
    ) : (
      apiTokens.map(token => (
        <Table.Row key={token.key}>
          <Table.Cell>{token.name}</Table.Cell>
          <Table.Cell>{truncate(20, token.key)}</Table.Cell>
          <Table.Cell textAlign="center">
            <ButtonGroup>
              <Button
                icon="trash"
                color="red"
                onClick={this.setDestroyModalState({ open: true, key: token.key })}
              />
            </ButtonGroup>
          </Table.Cell>
        </Table.Row>
      ))
    );

    return (
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell width={5}>Token name</Table.HeaderCell>
            <Table.HeaderCell width={5}>Key</Table.HeaderCell>
            <Table.HeaderCell width={1} />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows}
        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan={3}>
              <Button
                floated="right"
                onClick={this.setCreateModalState({ open: true })}
              >
                Create Token
              </Button>
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    );
  }

  render() {
    return (
      <div>
        <Header>API Tokens</Header>
        {this.renderTable()}
        {this.renderCreateModal()}
        {this.renderDestroyModal()}
      </div>
    );
  }
}

export default createContainer(() => ({
  user: Meteor.user(),
}), APITokensList);
