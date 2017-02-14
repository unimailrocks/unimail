import React, { PropTypes } from 'react';
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
  template: PropTypes.shape({
    sources: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        identifier: PropTypes.string,
      }),
    ).isRequired,
  }).isRequired,
};
