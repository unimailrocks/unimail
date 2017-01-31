import React from 'react';
import { IndexRoute, Route } from 'react-router';
import TemplatesPage from './page';
import TemplateEditor from './editor';

export default function TemplatesRoute(path) {
  return (
    <Route path={path}>
      <IndexRoute component={TemplatesPage} />
      <Route path=":id" component={TemplateEditor} />
    </Route>
  );
}
