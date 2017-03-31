import React, { Component, PropTypes } from 'react';
import omit from 'lodash/fp/omit';
import { Input } from 'semantic-ui-react';

export default class StandardInput extends Component {
  static propTypes = {
    triggerOnEnter: PropTypes.bool,
    triggerOnBlur: PropTypes.bool,
    clearOnSubmit: PropTypes.bool,
    onTrigger: PropTypes.func.isRequired,
    excludeButton: PropTypes.bool,
    color: PropTypes.string,
    icon: PropTypes.string,
    buttonText: PropTypes.string,
    initialValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  };

  static defaultProps = {
    triggerOnEnter: true,
    triggerOnBlur: true,
    clearOnSubmit: false,
    excludeButton: false,
    color: 'green',
    icon: null,
    buttonText: null,
    initialValue: '',
  };

  constructor(props) {
    super(props);

    this.state = {
      value: props.initialValue,
    };
  }

  onChange = e => {
    this.setState({
      value: e.target.value,
    });
  };

  onBlur = () => {
    if (!this.props.triggerOnBlur) {
      return;
    }

    this.props.onTrigger(this.state.value);
  };

  onKeyDown = e => {
    if (e.key === 'Enter') {
      if (!this.props.triggerOnEnter) {
        return;
      }

      this.props.onTrigger(this.state.value);
      if (this.props.clearOnSubmit) {
        this.clear();
      }
    }
  };

  clear() {
    this.setState({
      value: '',
    });
  }

  buttonObject() {
    if (this.props.excludeButton) {
      return null;
    }

    return {
      color: this.props.color,
      icon: this.props.icon,
      content: this.props.buttonText,
    };
  }

  render() {
    const omittedProps = omit([
      'triggerOnEnter',
      'triggerOnBlur',
      'clearOnSubmit',
      'onTrigger',
      'excludeButton',
      'color',
      'icon',
      'buttonText',
      'initialValue',
    ])(this.props);

    return (
      <Input
        onChange={this.onChange}
        action={this.buttonObject()}
        onBlur={this.onBlur}
        onKeyDown={this.onKeyDown}
        {...omittedProps}
        value={this.state.value}
      />
    );
  }
}
