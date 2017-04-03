import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { Menu, Icon, Rail } from 'semantic-ui-react';

import { selectTool } from '/imports/templates/editor/duck';

class TemplateBodyLeftRail extends Component {
  static propTypes = {
    tool: PropTypes.oneOf(['draw-image', null]).isRequired,
    selectTool: PropTypes.func.isRequired,
  };

  selectTool = (e, { name }) => {
    if (this.props.tool === name) {
      this.props.selectTool(null);
      return;
    }
    this.props.selectTool(name);
  }

  render() {
    const { tool } = this.props;
    return (
      <Rail attached position="left">
        <Menu icon="labeled" vertical>
          <Menu.Item
            name="draw-image"
            active={tool === 'draw-image'}
            onClick={this.selectTool}
          >
            <Icon name="picture" />
            Draw Image
          </Menu.Item>
        </Menu>
      </Rail>
    );
  }
}

TemplateBodyLeftRail.propTypes = {
};

function mapStateToProps({ editor }) {
  return {
    tool: editor.tool,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    selectTool: tool => dispatch(selectTool(tool)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TemplateBodyLeftRail);
