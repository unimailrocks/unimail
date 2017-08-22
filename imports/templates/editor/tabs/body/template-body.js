import { find, isEqual } from 'lodash/fp';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Segment } from 'semantic-ui-react';
import { connect } from 'react-redux';

import UnimailPropTypes from '/imports/prop-types';
import * as Templates from '/imports/templates/methods';

import KeyListener from '/imports/components/key-listener';
import {
  enterGuidedMode,
  enterUnguidedMode,
  enterLockedMode,
  enterUnlockedMode,
  selectTool,
  items,
  tryDelete,
} from '../../duck';

import DeletingShroud from './components/deleting-shroud';
import Template from './components/template';
import DrawingCanvas from './components/drawing-canvas';

class TemplateBody extends Component {
  static propTypes = {
    template: UnimailPropTypes.template.isRequired,
    tool: UnimailPropTypes.tool,
    enterGuidedMode: PropTypes.func.isRequired,
    enterUnguidedMode: PropTypes.func.isRequired,
    enterLockedMode: PropTypes.func.isRequired,
    enterUnlockedMode: PropTypes.func.isRequired,
    selectedItemPaths: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
    tryDelete: PropTypes.func.isRequired,
    locked: PropTypes.bool.isRequired,
    deleting: PropTypes.bool.isRequired,
    selectItem: PropTypes.func.isRequired,
    unselectItem: PropTypes.func.isRequired,
    selectTool: PropTypes.func.isRequired,
    shieldKeys: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    tool: null,
  }

  onDraw = async (item) => {
    if (this.props.tool === 'select-box') {
      this.groupSelect(item);
      return;
    }

    this.addElement(item);
    this.props.selectTool(null);
  }

  async addElement(item) {
    const { selectItem } = this.props;
    try {
      const { item: newItem, path } = await Templates.Items.placeItem.callPromise({
        templateID: this.props.template._id,
        item,
      });

      selectItem([...path, newItem._id]);
    } catch (e) {
      console.error(e.error || e);
    } finally {
      this.props.selectTool(null);
    }
  }

  groupSelect({ placement }) {
    const overlappingPaths = Templates.Items.allOverlappingItemPaths(
      placement,
      this.props.template,
    );

    if (overlappingPaths.length === 0) {
      return;
    }

    const { selectItem, unselectItem, selectedItemPaths } = this.props;

    const overlapsBorders = overlappingPaths.filter(p => !p.entirelyContained);
      // if the selection box doesn't overlap with any borders, toggle the innermost item
    if (overlapsBorders.length === 0) {
      const path = overlappingPaths.reduce((innermost, { path: current }) => {
        if (current.length > innermost.length) {
          return current;
        }

        return innermost;
      }, []);

      const isSelected = find(isEqual(path), selectedItemPaths);
      if (isSelected) {
        unselectItem(path);
      } else {
        selectItem(path);
      }
    } else {
        // otherwise, select all items we intersected with
      overlapsBorders.forEach(({ path }) => selectItem(path));
    }
  }

  itemMoved = ({ path, newPosition }) => {
    const { _id: templateID } = this.props.template;
    return Templates.Items.moveItem.callPromise({
      templateID,
      placement: newPosition,
      path,
    });
  };

  itemResized = ({ path, diff }) => {
    const { _id: templateID } = this.props.template;
    return Templates.Items.resizeItem.callPromise({
      templateID,
      diff,
      path,
    });
  }

  testDraw = rect => {
    const { tool } = this.props;
    if (tool === 'select-box') {
      return true;
    }

    const placed = Templates.Items.calculateItemPlacement(rect, this.props.template.items, {
      outerPossible: tool === 'draw-container',
    });

    return !!placed;
  }

  render() {
    const asPrevented = f => e => { console.log('prevented'); e.preventDefault(); f(); };
    return (
      <Segment
        raised
        style={{
          width: '600px',
          margin: '0 auto',
          padding: 0,
        }}
      >
        {
          this.props.deleting ? (
            <DeletingShroud
              onDelete={this.props.tryDelete}
            />
          ) : null
        }
        {
          this.props.shieldKeys ? null :
          <KeyListener
            onDeleteDown={asPrevented(this.props.tryDelete)}
            onBackspaceDown={asPrevented(this.props.tryDelete)}
            onShiftDown={() => this.props.selectTool('select-box')}
            onShiftUp={() => this.props.selectTool(null)}
            onControlDown={this.props.enterLockedMode}
            onControlUp={this.props.enterUnlockedMode}
          />
        }
        <div style={{ position: 'relative' }}>
          <DrawingCanvas onDraw={this.onDraw} testDraw={this.testDraw} />
          <Template
            itemMoved={this.itemMoved}
            itemResized={this.itemResized}
          />
        </div>
      </Segment>
    );
  }
}

function mapStateToProps(state) {
  return {
    tool: state.editor.tool,
    locked: state.editor.modes.locked,
    deleting: state.editor.deleting,
    selectedItemPaths: state.editor.selectedItemPaths,
    shieldKeys: state.editor.modes.shieldKeys,
  };
}

export default connect(mapStateToProps, {
  enterGuidedMode,
  enterUnguidedMode,
  enterUnlockedMode,
  enterLockedMode,
  selectItem: items.select,
  unselectItem: items.unselect,
  selectTool,
  tryDelete,
})(TemplateBody);
