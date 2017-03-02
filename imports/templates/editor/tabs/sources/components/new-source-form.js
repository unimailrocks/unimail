import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import UnimailPropTypes from '/imports/prop-types';
import SourceForm from './source-form';

export default class NewSourceForm extends Component {
  static propTypes = {
    template: UnimailPropTypes.template.isRequired,
  };

  state = {
    type: 'new',
    name: '',
    error: null,
  };

  onPropertyChange = (name, value) => {
    this.setState({
      [name]: value,
    });
  };

  onSave = async () => {
    const { type, name } = this.state;
    try {
      await Meteor.callPromise(
        'templates.sources.create',
        this.props.template._id,
        { type, name },
      );
    } catch (e) {
      this.setState({
        error: e.error,
      });
    }
  };

  canSave() {
    const { type, name } = this.state;
    return (
      type !== 'new'
      && name.length > 0
    );
  }

  render() {
    return (
      <SourceForm
        type={this.state.type}
        canSave={this.canSave()}
        onSave={this.onSave}
        onPropertyChange={this.onPropertyChange}
        error={this.state.error}
        name={this.state.name}
        editableFields={['name', 'type']}
      />
    );
  }
}
