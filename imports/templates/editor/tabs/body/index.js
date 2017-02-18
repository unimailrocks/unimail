import React from 'react';
import { Grid } from 'semantic-ui-react';
import { StickyContainer, Sticky } from 'react-sticky';
import TemplateBody from './template-body';
import LeftRail from './components/left-rail';
import RightRail from './components/right-rail';

export default function BodyTab(props) {
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
          <LeftRail />
        </Sticky>
        <Sticky>
          <RightRail />
        </Sticky>
        <TemplateBody {...props} />
      </div>
    </StickyContainer>
  );
}
