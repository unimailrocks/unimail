import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { Menu, Icon, Rail } from 'semantic-ui-react';

import UnimailPropTypes from '/imports/prop-types';
import { selectTool } from '/imports/templates/editor/duck';

class TemplateBodyLeftRail extends Component {
  static propTypes = {
    tool: UnimailPropTypes.tool,
    selectTool: PropTypes.func.isRequired,
  };

  static defaultProps = {
    tool: null,
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
            name="draw-container"
            active={tool === 'draw-container'}
            onClick={this.selectTool}
          >
            <Icon name="square outline" />
            Draw Container
          </Menu.Item>

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
