import React from 'react';
import { Route } from 'react-router-dom';
import UnimailPropTypes from '/imports/prop-types';
import TemplatesPage from './page';
import TemplateEditor from './editor';

export default function TemplatesRouter({ match }) {
  return (
    <div>
      <Route exact path={match.url} component={TemplatesPage} />
      <Route path={`${match.url}/:id`} component={TemplateEditor} />
    </div>
  );
}

TemplatesRouter.propTypes = {
  match: UnimailPropTypes.match.isRequired,
};
