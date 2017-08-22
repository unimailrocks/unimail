import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Label, Icon } from 'semantic-ui-react';
import ColorPicker from '../color-picker';

export default class BackgroundEditor extends Component {
  state = { open: false };

  open = () => {
    this.setState(() => ({ open: true }));
  }

  close = () => {
    this.setState(() => ({ open: false }));
  }

  render() {
    const { open } = this.state;
    const { background, onPreview, onChange } = this.props;

    return (
      <div>
        <Label><Icon name="sticky note" />Background: </Label>
        <div
          onClick={this.open}
          style={{
            backgroundColor: background,
            border: '1px solid black',
            height: '1em',
            width: '2em',
          }}
        />
        {
          open ? (
            <div style={{ position: 'absolute', zIndex: 10 }}>
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  right: 0,
                  left: 0,
                  bottom: 0,
                }}
                onClick={this.close}
              />
              <ColorPicker
                color={background}
                onChange={onPreview}
                onChangeComplete={onChange}
              />
            </div>
          ) : null
        }
      </div>
    );
  }
}

BackgroundEditor.propTypes = {
  background: PropTypes.string.isRequired,
  onPreview: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};
