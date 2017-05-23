import React, { Component } from 'react';
import { StickyContainer, Sticky } from 'react-sticky';
import UnimailPropTypes from '/imports/prop-types';
import TemplateBody from './template-body';
import LeftRail from './components/left-rail';
import RightRail from './components/right-rail';

export default class BodyTab extends Component {
  static propTypes = {
    template: UnimailPropTypes.template.isRequired,
  };

  state = {
    focusedContent: null,
    focusedContentType: null,
  };

  focusContent = (focusedContentType, focusedContent) => {
    this.setState({
      focusedContent,
      focusedContentType,
    });
  };

  render() {
    return (
      <StickyContainer>
        <div
          style={{
            width: '600px',
            margin: '0 auto',
            position: 'relative',
          }}
        >
          <Sticky>
            {
              ({ style }) => (
                <div style={style}>
                  <LeftRail />
                </div>
              )
            }
          </Sticky>
          <Sticky>
            {
              ({ style }) => (
                <div style={style}>
                  <RightRail
                    content={this.state.focusedContent}
                    contentType={this.state.focusedContentType}
                    onFocusContent={this.focusContent}
                    template={this.props.template}
                  />
                </div>
              )
            }
          </Sticky>
          <TemplateBody
            {...this.props}
            onFocusContent={this.focusContent}
          />
        </div>
      </StickyContainer>
    );
  }
}
