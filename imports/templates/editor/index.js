import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { Container, Segment, Menu } from 'semantic-ui-react';
import UnimailPropTypes from '/imports/prop-types';
import { Templates } from '/imports/templates';

import { registerTemplate } from './duck';
import NameInput from './name-input';
import Tab from './tabs';

class TemplateEditor extends Component {
  static propTypes = {
    template: UnimailPropTypes.template,
    match: UnimailPropTypes.match.isRequired,
    registerTemplate: PropTypes.func.isRequired,
  };

  static defaultProps = {
    template: null,
  };

  constructor(props) {
    super(props);
    if (props.template) {
      props.registerTemplate(props.template);
    }
  }

  state = {
    activeTab: 'body',
    errors: {},
    newTemplateID: null,
  };

  componentWillReceiveProps({ template: newTemplate }, { template: oldTemplate }) {
    if (!oldTemplate && newTemplate) {
      this.props.registerTemplate(newTemplate);
    }
  }

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

const reduxContain = connect(null, {
  registerTemplate,
});

export default createContainer(({ match }) => {
  Meteor.subscribe('templates');

  return {
    template: Templates.findOne(match.params.id),
  };
}, reduxContain(TemplateEditor));
