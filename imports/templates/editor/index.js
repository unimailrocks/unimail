import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { browserHistory } from 'react-router';
import { Container, Segment } from 'semantic-ui-react';
import { Templates } from '/imports/templates';

import NameInput from './name-input';

class TemplateEditor extends Component {

  editTitle = async newTitle => {
    if (this.props.routeParams.id === 'new') {
      const newTemplateID = await Meteor.callPromise('templates.create', newTitle);
      browserHistory.push(`/templates/${newTemplateID}`);
    } else {
      // TODO Update title
    }
  };

  render() {
    if (!this.props.template) {
      return (
        <Container>
          <Segment className="masthead" vertical>
            <NameInput editing onChange={this.editTitle} />
          </Segment>
        </Container>
      );
    }

    return (
      <Container>
        <Segment className="masthead" vertical>
          <NameInput title={this.props.template.title} onChange={this.editTitle} />
        </Segment>
      </Container>
    );
  }
}

TemplateEditor.propTypes = {
  template: PropTypes.shape({
    title: PropTypes.string.isRequired,
  }),
  routeParams: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
};

TemplateEditor.defaultProps = {
  template: null,
};

export default createContainer(({ routeParams }) => {
  Meteor.subscribe('templates');
  const template = Templates.findOne(routeParams.id);
  console.log(template);

  return {
    template,
  };
}, TemplateEditor);
