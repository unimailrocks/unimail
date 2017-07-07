import React, { Component } from 'react';
import { Button } from 'semantic-ui-react';
import UnimailPropTypes from '/imports/prop-types';
import { Renders } from '/imports/templates/methods';

export default class RenderTab extends Component {
  createRender = async () => {
    await Renders.createRender.callPromise({
      templateID: this.props.template._id,
    });
  }

  render() {
    const { template } = this.props;
    return (
      <div>
        <h2>Render &ldquo;{template.title}&rdquo;</h2>
        <em>Inputs will go here</em>
        <br />
        <br />
        <Button primary onClick={this.createRender}>
          Render!
        </Button>
      </div>
    );
  }
}

RenderTab.propTypes = {
  template: UnimailPropTypes.template.isRequired,
};
