import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Header } from 'semantic-ui-react';

import UnimailPropTypes from '/imports/prop-types';
import { Items } from '/imports/templates/methods';
import StyleAdder from '/imports/components/form-controls/style-adder';
import { previewStyles } from '../../../../duck';

import StyleList from './style-list';

function ContainerForm({ item, path, shieldKeys, unshieldKeys, template, previewStyles }) {
  return (
    <div>
      <Header sub>Custom styles</Header>
      <StyleAdder
        styles={item.styles}
        onFocus={shieldKeys}
        onBlur={unshieldKeys}
        onAdd={({ property, value }) =>
          Items.changeStyle.callPromise({
            templateID: template._id,
            path,
            style: { property, value },
          })
        }
      />
      <StyleList
        styles={item.styles}
        onPreview={(alteration) => previewStyles({ path, alteration })}
      />
    </div>
  );
}

ContainerForm.propTypes = {
  item: UnimailPropTypes.item.isRequired,
  path: PropTypes.arrayOf(PropTypes.string).isRequired,
  shieldKeys: PropTypes.func.isRequired,
  unshieldKeys: PropTypes.func.isRequired,
  template: UnimailPropTypes.template.isRequired,
  previewStyles: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
  return {
    template: state.editor.template,

  };
}

export default connect(mapStateToProps, { previewStyles })(ContainerForm);
