import React, { Component } from 'react';
import { StickyContainer, Sticky } from 'react-sticky';
import TemplateBody from './template-body';
import LeftRail from './components/left-rail';
import RightRail from './components/right-rail';

export default class BodyTab extends Component {
  state = {
    focusedContent: null,
    focusedContentType: null,
    rowsLocked: false,
  };

  focusContent = (focusedContentType, focusedContent) => {
    this.setState({
      focusedContent,
      focusedContentType,
    });
  };

  toggleRowsLocked = () => {
    this.setState({
      rowsLocked: !this.state.rowsLocked,
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
            <LeftRail
              rowsLocked={this.state.rowsLocked}
              toggleRowsLocked={this.toggleRowsLocked}
            />
          </Sticky>
          <Sticky>
            <RightRail
              content={this.state.focusedContent}
              contentType={this.state.focusedContentType}
              onFocusContent={this.focusContent}
            />
          </Sticky>
          <TemplateBody
            {...this.props}
            rowsLocked={this.state.rowsLocked}
            onFocusContent={this.focusContent}
          />
        </div>
      </StickyContainer>
    );
  }
}
