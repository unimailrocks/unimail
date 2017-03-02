import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import UnimailPropTypes from '/imports/prop-types';
import SourceForm from './source-form';

export default class ExistingSource extends Component {
  static propTypes = {
    template: UnimailPropTypes.template.isRequired,
    source: UnimailPropTypes.source.isRequired,
  };

  state = {
    error: '',
  };

  onPropertyChange = async (name, value) => {
    try {
      await Meteor.callPromise('templates.sources.update', this.props.template._id, {
        ...this.props.source,
        [name]: value,
      });
      this.setState({
        error: '',
      });
    } catch (e) {
      this.setState({
        error: e.error,
      });
    }
  };

  delete = async () => {
    try {
      await Meteor.callPromise(
        'templates.sources.delete',
        this.props.template._id,
        this.props.source._id,
      );
    } catch (e) {
      this.setState({
        error: `Cannot delete: ${e.error}`,
      });
    }
  };

  render() {
    const { source } = this.props;
    return (
      <SourceForm
        error={this.state.error}
        editableFields={['name']}
        type={source.type}
        onPropertyChange={this.onPropertyChange}
        name={source.name}
        onDelete={this.delete}
      />
    );
  }
}
