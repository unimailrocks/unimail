import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Header, Button, Modal } from 'semantic-ui-react';
import UnimailPropTypes from '/imports/prop-types';

export default class DeleteUserModal extends Component {
  static propTypes = {
    user: UnimailPropTypes.user.isRequired,
    big: PropTypes.bool,
  }

  static defaultProps = {
    big: false,
  }

  state = { open: false }

  openModal = () => {
    this.setState(() => ({ open: true }));
  }

  closeModal = () => {
    this.setState(() => ({ open: false }));
  }

  deleteUser = () => {
    Meteor.callPromise('users.delete', this.props.user._id);
  }

  renderButton() {
    const { big } = this.props;

    if (!big) {
      return (
        <Button
          icon="delete"
          color="red"
          size="small"
          onClick={this.openModal}
        />
      );
    }

    return null;
  }

  render() {
    const { user } = this.props;
    return (
      <Modal definition fixed open={this.state.open} basic small trigger={this.renderButton()}>
        <Header icon="delete" content={`Deleting ${user.emails[0].address}`} />
        <Modal.Content>
          <p>Are you sure you want to delete this user?</p>
        </Modal.Content>
        <Modal.Actions>
          <Button basic inverted onClick={this.closeModal}>Cancel</Button>
          <Button basic color="red" onClick={this.deleteUser}>Delete</Button>
        </Modal.Actions>
      </Modal>
    );
  }
}
