import React from 'react';
import UnimailPropTypes from '/imports/prop-types';
import NewSourceForm from './components/new-source-form';
import ExistingSource from './components/existing-source';

export default function SourcesTab({ template }) {
  return (
    <div>
      {
        template.sources.map(s => (
          <ExistingSource key={s._id} template={template} source={s} />
        ))
      }
      {/* key makes it rerender to clear fields each new source */}
      {/* kinda hacky */}
      <NewSourceForm template={template} key={template.sources.length} />
    </div>
  );
}

SourcesTab.propTypes = {
  template: UnimailPropTypes.template.isRequired,
};
