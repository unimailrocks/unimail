import React, { Component } from 'react';
import { Button } from 'semantic-ui-react';
import UnimailPropTypes from '/imports/prop-types';
import { Renders } from '/imports/templates/methods';

export default class RenderTab extends Component {
  state = {
    renderedHTML: null,
  };

  createRender = async () => {
    const html = await Renders.createRender.callPromise({
      templateID: this.props.template._id,
    });

    this.setState(() => ({
      renderedHTML: html,
    }), () => {
      const iframe = this.previewIframe;
      const document = iframe.contentDocument || iframe.contentWindow.document;
      document.body.innerHTML = this.state.renderedHTML;
      document.body.style.margin = 0;
    });
  }

  registerNewIframe = iframe => {
    this.previewIframe = iframe;
  }

  render() {
    const { template } = this.props;
    const { renderedHTML } = this.state;
    return (
      <div>
        <h2>Render &ldquo;{template.title}&rdquo;</h2>
        <em>Inputs will go here</em>
        <br />
        <br />

        <Button primary onClick={this.createRender}>
          Render!
        </Button>

        {
          renderedHTML ? ([
            <h3 key="preview-label">Preview</h3>,
            <iframe
              key="preview-iframe"
              title={`Rendered ${template.title}`}
              ref={this.registerNewIframe}
              width="600"
              height="800"
            />,
            <h3 key="code-label">Code</h3>,
            <textarea key="rendered-html" defaultValue={renderedHTML} />,
          ]) : null
        }
      </div>
    );
  }
}

RenderTab.propTypes = {
  template: UnimailPropTypes.template.isRequired,
};
