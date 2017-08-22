import { map as _map } from 'lodash/fp';
import React from 'react';
import PropTypes from 'prop-types';
import StyleEditor from '/imports/components/form-controls/style-editor';

const map = _map.convert({ cap: false });

export default function StyleList({ styles, onChange, onPreview }) {
  return (
    <ul>
      {
        map((v, k) => (
          <li key={k}>
            <StyleEditor
              property={k}
              value={v}
              onChange={
                newVal => onChange({ property: k, value: newVal })
              }
              onPreview={
                newVal => onPreview({ property: k, value: newVal })
              }
            />
          </li>
        ), styles)
      }
    </ul>
  );
}

StyleList.propTypes = {
  styles: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  onPreview: PropTypes.func.isRequired,
};

StyleList.defaultProps = {
  styles: {},
};
