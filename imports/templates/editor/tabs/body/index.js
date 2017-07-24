import React, { Component } from 'react';
import { StickyContainer, Sticky } from 'react-sticky';
import TemplateBody from './template-body';
import LeftRail from './components/left-rail';
import RightRail from './components/right-rail';

export default class BodyTab extends Component {
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
                  <RightRail />
                </div>
              )
            }
          </Sticky>
          <TemplateBody {...this.props} />
        </div>
      </StickyContainer>
    );
  }
}
