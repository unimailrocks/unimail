import React, { Component, PropTypes } from 'react';
import { Label, Input, Button } from 'semantic-ui-react';

export default class NameInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editing: props.editing,
      title: props.title,
    };
  }

  onKeyDown = e => {
    if (e.key === 'Enter') {
      this.commit();
    }
  };

  type = e => {
    this.setState({
      title: e.target.value,
    });
  };

  commit = () => {
    this.setState({
      editing: false,
    });

    this.props.onChange(this.state.title);
  };

  enterEditMode = () => {
    this.setState({
      editing: true,
    });
  };

  render() {
    const button = this.state.editing ? (
      <Button
        content="OK"
        basic
        color="green"
        onClick={this.commit}
        size="mini"
        compact
      />
    ) : null;
    return (
      <div>
        <Label ribbon color="blue">Title</Label>
        <Input
          value={this.state.title}
          fluid
          transparent
          placeholder="Title..."
          size="massive"
          onChange={this.type}
          onKeyDown={this.onKeyDown}
          onBlur={this.commit}
          onFocus={this.enterEditMode}
        >
          <input autoFocus />
          {button}
        </Input>
      </div>
    );
  }
}

NameInput.propTypes = {
  title: PropTypes.string,
  editing: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

NameInput.defaultProps = {
  title: '',
  editing: false,
};
