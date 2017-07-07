import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import { memoize } from 'lodash/fp';

import PropTypes from 'prop-types';

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Container, Button, List, Modal, Header, Icon } from 'semantic-ui-react';

import Templates from './collection';

import TemplatePermissionsFormModal from './components/permissions-form-modal';


class TemplatesPage extends Component {
  state = {
    openDeleteModal: null,
    openPermissionsModal: null,
  };

  closeModal = () => {
    this.setState({
      openDeleteModal: null,
      openPermissionsModal: null,
    });
  }

  createOpenDeleteModalHandler = memoize(templateID => () => {
    this.setState({
      openDeleteModal: templateID,
    });
  });

  createOpenPermissionsModalHandler = memoize(templateID => () => {
    this.setState({
      openPermissionsModal: templateID,
    });
  });

  createTemplateDeleteHandler = memoize(templateID => async () => {
    try {
      await Meteor.callPromise('templates.delete', templateID);
    } catch (e) {
      alert('You do not have permissions to delete that template!');
    }
    this.closeModal();
  });

  createTemplatePermissionsChangeHandler = memoize(templateID => async ({ editors, viewers }) => {
    try {
      await Promise.all([
        Meteor.callPromise('templates.editors.update', templateID, editors),
        Meteor.callPromise('templates.viewers.update', templateID, viewers),
      ]);
    } catch (e) {
      alert('You do not have permissions to manage this template\'s permissions!');
    }
  });

  render() {
    const { templates } = this.props;
    return (
      <Container>
        <Link to="/templates/new">
          <Button content="New" icon="plus" labelPosition="right" basic color="green" />
        </Link>
        <List relaxed divided verticalAlign="middle">
          {
            templates.map(t => (
              <List.Item key={t._id}>
                <List.Content floated="left">
                  <Link
                    to={`/templates/${t._id}/body`}
                    style={{ lineHeight: '40px', color: 'black' }}
                    key={
                      /* this combats a freaky Chrome browser glitch
                         that causes these guys to disappear when modals
                         close. So we force them to rerender when modals
                         close... */
                      [
                        this.state.openDeleteModal,
                        this.state.openPermissionsModal,
                      ].join('')
                    }
                  >
                    {t.title}
                  </Link>
                </List.Content>
                <List.Content floated="right">
                  <Button.Group style={{ lineHeight: '40px' }}>
                    <Modal
                      trigger={
                        <Button
                          onClick={this.createOpenDeleteModalHandler(t._id)}
                          icon="trash"
                        />
                      }
                      basic
                      open={this.state.openDeleteModal === t._id}
                      onClose={this.closeModal}
                      size="small"
                    >
                      <Header>
                        <Icon
                          name="trash"
                          color="red"
                        />
                        Are you sure you want to delete this template?</Header>
                      <Modal.Content>
                        <p>You are about to delete template &ldquo;{t.title}&rdquo;</p>
                        <p>This <span style={{ color: 'red' }}>cannot be undone</span>.</p>
                        <p>Are you sure you want to delete this template?</p>
                      </Modal.Content>
                      <Modal.Actions>
                        <Button
                          basic
                          inverted
                          onClick={this.closeModal}
                        >
                          Cancel
                        </Button>
                        <Button
                          basic
                          color="red"
                          inverted
                          onClick={this.createTemplateDeleteHandler(t._id)}
                        >
                          <Icon name="trash" />Delete
                        </Button>
                      </Modal.Actions>
                    </Modal>
                    <TemplatePermissionsFormModal
                      onSave={this.createTemplatePermissionsChangeHandler(t._id)}
                      template={t}
                      trigger={
                        <Button
                          onClick={this.createOpenPermissionsModalHandler(t._id)}
                          icon="lock"
                        />
                      }
                      onClose={this.closeModal}
                      open={this.state.openPermissionsModal === t._id}
                    />
                  </Button.Group>
                </List.Content>
              </List.Item>
            ))
          }
        </List>
      </Container>
    );
  }
}

TemplatesPage.propTypes = {
  templates: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
  })).isRequired,
};

export default createContainer(() => {
  Meteor.subscribe('templates');

  return {
    templates: Templates.find().fetch(),
  };
}, TemplatesPage);
