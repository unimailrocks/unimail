import { without, keys, camelCase } from 'lodash/fp';
import React from 'react';
import PropTypes from 'prop-types';
import { Form, Dropdown } from 'semantic-ui-react';

const defaults = {
  background: '#ffffff',
  border: {
    width: 1,
    style: 'solid',
    color: '#000000',
    radius: 0,
  },
};

function styleOption(propertyName) {
  const base = {
    key: propertyName,
    value: camelCase(propertyName),
  };

  switch (propertyName) {
    case 'background':
      return {
        ...base,
        text: 'Background',
        icon: 'sticky note',
      };
    case 'border':
      return {
        ...base,
        text: 'Border',
        icon: 'square outline',
      };
    default:
      console.error(`No style option defined for ${propertyName}`);
      return null;
  }
}

export default function StyleAdder({
  styles,
  availableStyles,
  onAdd,
}) {
  const options = without(keys(styles), availableStyles).map(styleOption);
  if (options.length === 0) {
    return null;
  }

  return (
    <Form>
      <Dropdown
        selection
        options={options}
        search
        placeholder="Choose to add a style property"
        value={null}
        fluid
        onChange={
          (_, { value }) => {
            onAdd({ property: value, value: defaults[value] });
          }
        }
      />
    </Form>
  );
}

StyleAdder.propTypes = {
  availableStyles: PropTypes.arrayOf(PropTypes.string),
  styles: PropTypes.object,
  onAdd: PropTypes.func.isRequired,
};

StyleAdder.defaultProps = {
  availableStyles: keys(defaults),
  styles: {},
};
