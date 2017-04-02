import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Container, Segment, Menu } from 'semantic-ui-react';
import UnimailPropTypes from '/imports/prop-types';
import { Templates } from '/imports/templates';

import NameInput from './name-input';
import Tab from './tabs';

class TemplateEditor extends Component {

  state = {
    activeTab: 'body',
    errors: {},
    newTemplateID: null,
  };

  onTabClick = (e, { name }) => {
    this.setState({
      activeTab: name,
    });
  };

  editTitle = async newTitle => {
    try {
      if (this.props.match.params.id === 'new') {
        const newTemplateID = await Meteor.callPromise('templates.create', newTitle);
        this.setState({
          newTemplateID,
        });
      } else {
        // TODO: cancel this promise if component gets unmounted
        await Meteor.callPromise('templates.title.edit', this.props.match.params.id, newTitle);
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
    if (!this.props.template && this.state.newTemplateID) {
      return <Redirect to={this.state.newTemplateID} />;
    }

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
  template: UnimailPropTypes.template,
  match: UnimailPropTypes.match.isRequired,
};

TemplateEditor.defaultProps = {
  template: null,
};

export default createContainer(({ match }) => {
  Meteor.subscribe('templates');

  return {
    template: Templates.findOne(match.params.id),
  };
}, TemplateEditor);
