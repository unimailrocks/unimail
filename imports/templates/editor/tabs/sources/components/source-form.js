import React, { PropTypes } from 'react';
import {
  Segment,
  Label,
  Dropdown,
  Input,
  Form,
  Button,
} from 'semantic-ui-react';

const labelColors = {
  webpage: 'teal',
  text: 'violet',
  error: 'red',
  new: 'grey',
};

const typeOptions = [
  {
    text: 'Webpage',
    value: 'webpage',
    icon: 'linkify',
  },
  {
    text: 'Text',
    value: 'text',
    icon: 'paragraph',
  },
];

export default function SourceForm({
  error,
  type,
  onPropertyChange,
  canSave,
  onSave,
  name,
  editableFields,
}) {
  const saveButton = onSave ? (
    <Button onClick={onSave} disabled={!canSave} basic color="green">
      + Add
    </Button>
  ) : null;

  const typeField = editableFields.includes('type') ? (
    <Form.Field>
      <label htmlFor="source-type">Type</label>
      {' '}
      <Dropdown
        placeholder="Source type"
        selection
        options={typeOptions}
        name="source-type"
        onChange={(e, d) => onPropertyChange('type', d.value)}
      />
    </Form.Field>
  ) : null;

  const nameField = editableFields.includes('name') ? (
    <Form.Field>
      <label htmlFor="source-name">Name</label>
      <Input
        fluid
        name="source-name"
        placeholder="Source name"
        onBlur={onNameChange}
        onKeyDown={onNameKeyDown}
        defaultValue={name}
      />
    </Form.Field>
  ) : null;

  function onNameChange(e) {
    onPropertyChange('name', e.target.value);
  }

  function onNameKeyDown(e) {
    if (e.key === 'Enter') {
      onPropertyChange('name', e.target.value);
    }
  }

  return (
    <Segment raised>
      <Label color={error ? labelColors.error : labelColors[type]} ribbon>
        {error ? `${type}: ${error}` : type}
      </Label>
      <Form onSubmit={e => e.preventDefault()}>
        {typeField}
        {nameField}
        {saveButton}
      </Form>
    </Segment>
  );
}

SourceForm.propTypes = {
  error: PropTypes.string,
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onPropertyChange: PropTypes.func.isRequired,
  canSave: PropTypes.bool,
  onSave: PropTypes.func,
  editableFields: PropTypes.arrayOf(PropTypes.string),
};

SourceForm.defaultProps = {
  error: null,
  canSave: false,
  onSave: null,
  editableFields: [],
};
