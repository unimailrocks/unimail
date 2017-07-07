import startCase from 'lodash/fp/startCase';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect, Route, Link, Switch } from 'react-router-dom';
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
    errors: {},
    newTemplateID: null,
  };

  componentWillReceiveProps({ template: newTemplate }, { template: oldTemplate }) {
    if (!oldTemplate && newTemplate) {
      this.props.registerTemplate(newTemplate);
    }
  }

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
    const { template } = this.props;
    const { newTemplateID } = this.state;
    if (!template && newTemplateID) {
      return <Redirect to={`${newTemplateID}/body`} />;
    }

    if (!template) {
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

    const tabNames = ['sources', 'body', 'run'];
    const tabs = tabNames.map(name => (
      <Route
        path={`/templates/${template._id}/${name}`}
        key={name}
        render={() => (
          <div>
            <Menu pointing secondary>
              {
                tabNames.map(itemName => (
                  <Menu.Item active={itemName === name} key={itemName}>
                    <Link to={`/templates/${template._id}/${itemName}`}>
                      {startCase(itemName)}
                    </Link>
                  </Menu.Item>
                ))
              }
            </Menu>
            <Tab name={name} template={template} />
          </div>
        )}
      />
    ));

    return (
      <Container>
        <Segment className="masthead" vertical>
          <NameInput
            title={template.title}
            onChange={this.editTitle}
            error={this.state.errors.title}
          />
        </Segment>

        {
          template ? (
            <Switch>
              {tabs}
              <Route
                render={() => (
                  <Redirect to={`/templates/${template._id}/body`} />
                )}
              />
            </Switch>
          ) : null
        }
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
