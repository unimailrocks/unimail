import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { Container, Button, Table } from 'semantic-ui-react';

import Templates from './collection';

class TemplatesPage extends Component {
  render() {
    return (
      <Container>
        <Link to="/templates/new">
          <Button content="New" icon="plus" labelPosition="right" basic color="green" />
        </Link>
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Template Name</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {
              this.props.templates.map(t => (
                <Table.Row key={t._id}>
                  <Table.Cell>
                    <Link to={`/templates/${t._id}`}>{t.title}</Link>
                  </Table.Cell>
                </Table.Row>
              ))
            }
          </Table.Body>
        </Table>
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
