import React, { Component } from 'react';
import UnimailPropTypes from '/imports/prop-types';

export default class PreviewingRender extends Component {
  static propTypes = {
    render: UnimailPropTypes.render,
  }

  static defaultProps = {
    render: null,
  }

  registerIframe = iframe => {
    if (!iframe) {
      return;
    }

    const { render } = this.props;
    const document = iframe.contentDocument || iframe.contentWindow.document;
    document.open();
    document.write(render.html);
    document.close();
  }

  render() {
    const { render } = this.props;

    if (!render) {
      return null;
    }

    return (
      <div>
        <iframe
          title={`Render from ${render.renderedAt}`}
          ref={this.registerIframe}
          width="600"
          seamless="seamless"
          style={{
            border: 0,
            height: '80vh',
          }}
          scrolling="no"
        />

      </div>
    );
  }
}
