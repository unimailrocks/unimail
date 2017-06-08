import invoke from 'lodash/fp/invoke';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'semantic-ui-react';
import copy from 'copy-to-clipboard';

function selectInput(e) {
  e.target.setSelectionRange(0, e.target.value.length);
}

export default class Copyable extends Component {
  static propTypes = {
    text: PropTypes.string.isRequired,
  }

  state = { copied: false }

  copy = e => {
    e.preventDefault();
    copy(this.props.text);
    this.setState(() => ({ copied: true }));
  }

  render() {
    const { copied } = this.state;
    return (
      <Input
        action={{ onClick: this.copy, color: 'green', icon: copied ? 'checkmark' : 'copy' }}
        onKeyPress={invoke('preventDefault')}
        defaultValue={this.props.text}
        onFocus={selectInput}
      />
    );
  }
}
