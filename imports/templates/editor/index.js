import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { browserHistory } from 'react-router';
import { Container, Segment, Menu } from 'semantic-ui-react';
import { Templates } from '/imports/templates';

import NameInput from './name-input';
import Tab from './tabs';

class TemplateEditor extends Component {

  state = {
    activeTab: 'sources',
    errors: {},
  };

  onTabClick = (e, { name }) => {
    this.setState({
      activeTab: name,
    });
  };

  editTitle = async newTitle => {
    try {
      if (this.props.routeParams.id === 'new') {
        const newTemplateID = await Meteor.callPromise('templates.create', newTitle);
        browserHistory.push(`/templates/${newTemplateID}`);
      } else {
        await Meteor.callPromise('templates.title.edit', this.props.routeParams.id, newTitle);
      }

      this.setState({
        errors: {
          ...this.state.errors,
          title: null,
        },
      });
    } catch (e) {
      this.setState({
        errors: {
          ...this.state.errors,
          title: e.reason,
        },
      });
    }
  };

  render() {
    if (!this.props.template) {
      return (
        <Container>
          <Segment className="masthead" vertical>
            <NameInput
              editing
              error={this.state.errors.title}
              onChange={this.editTitle}
            />
          </Segment>
        </Container>
      );
    }

    const { activeTab } = this.state;
    return (
      <Container>
        <Segment className="masthead" vertical>
          <NameInput
            title={this.props.template.title}
            onChange={this.editTitle}
            error={this.state.errors.title}
          />
        </Segment>

        <Menu pointing secondary>
          <Menu.Item name="sources" active={activeTab === 'sources'} onClick={this.onTabClick} />
          <Menu.Item name="body" active={activeTab === 'body'} onClick={this.onTabClick} />
          <Menu.Item name="run" active={activeTab === 'run'} onClick={this.onTabClick} />
        </Menu>

        <Tab name={activeTab} template={this.props.template} />
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

  return {
    template: Templates.findOne(routeParams.id),
  };
}, TemplateEditor);
