import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import { memoize } from 'lodash/fp';

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { Container, Button, List, Modal, Header, Icon } from 'semantic-ui-react';

import Templates from './collection';


class TemplatesPage extends Component {
  state = {
    openDeleteModal: null,
  };

  closeDeleteModal = () => {
    this.setState({
      openDeleteModal: null,
    });
  }

  createOpenDeleteModalHandler = memoize(templateID => () => {
    this.setState({
      openDeleteModal: templateID,
    });
  });

  createTemplateDeleteHandler = memoize(templateID => async () => {
    try {
      await Meteor.callPromise('templates.delete', templateID);
    } catch (e) {
      alert('You do not have permissions to delete that template!');
    }
    this.closeDeleteModal();
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
                    to={`/templates/${t._id}`}
                    style={{ lineHeight: '40px', color: 'black' }}
                    key={
                      /* this combats a freaky Chrome browser glitch
                         that causes these guys to disappear when modals
                         close. So we force them to rerender when modals
                         close... */
                      this.state.openDeleteModal
                    }
                  >
                    {t.title}
                  </Link>
                </List.Content>
                <List.Content floated="right">
                  <Button.Group style={{ lineHeight: '40px' }}>
                    <Modal
                      trigger={<Button onClick={this.createOpenDeleteModalHandler(t._id)} icon="trash" />}
                      basic
                      open={this.state.openDeleteModal === t._id}
                      onClose={this.closeDeleteModal}
                      size="small"
                    >
                      <Header><Icon name="trash" color="red" /> Are you sure you want to delete this template?</Header>
                      <Modal.Content>
                        <p>You are about to delete template &ldquo;{t.title}&rdquo;</p>
                        <p>This <span style={{ color: 'red' }}>cannot be undone</span>.</p>
                        <p>Are you sure you want to delete this template?</p>
                      </Modal.Content>
                      <Modal.Actions>
                        <Button basic inverted onClick={this.closeDeleteModal}>Cancel</Button>
                        <Button basic color="red" inverted onClick={this.createTemplateDeleteHandler(t._id)}>
                          <Icon name="trash" />Delete
                        </Button>
                      </Modal.Actions>
                    </Modal>
                    <Button icon="lock" />
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
