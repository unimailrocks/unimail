import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import SourceForm from './source-form';

export default class ExistingSource extends Component {
  static propTypes = {
    template: PropTypes.shape({
      _id: PropTypes.string.isRequired,
    }).isRequired,
    source: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }).isRequired,
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
