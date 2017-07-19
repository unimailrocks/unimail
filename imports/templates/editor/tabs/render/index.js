import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Rail, Segment, Button, Modal } from 'semantic-ui-react';

import UnimailPropTypes from '/imports/prop-types';
import { commonFriendlyDateString } from '/imports/utils/strings';
import { Renders } from '/imports/templates/methods';
import { openRenderPreview, closeRenderPreview } from '/imports/templates/editor/duck';

import RendersList from './components/renders-list';
import PreviewingRender from './components/previewing-render';

class RenderTab extends Component {
  static propTypes = {
    template: UnimailPropTypes.template.isRequired,
    previewingRender: UnimailPropTypes.render,
    closePreview: PropTypes.func.isRequired,
    openPreview: PropTypes.func.isRequired,
  }

  static defaultProps = {
    previewingRender: null,
  }

  createRender = async () => {
    const render = await Renders.createRender.callPromise({
      templateID: this.props.template._id,
    });

    this.props.openPreview(render);
  }

  render() {
    const { template, previewingRender, closePreview } = this.props;
    return (
      <Segment style={{ minHeight: '50vh' }}>
        <h2>Render &ldquo;{template.title}&rdquo;</h2>
        <em>Inputs will go here</em>
        <br />
        <br />

        <Button primary onClick={this.createRender}>
          Render!
        </Button>

        <Rail internal position="right">
          <Segment>
            <h2>Previously rendered</h2>
            <div style={{ height: '50vh' }}>
              <RendersList template={template} />
            </div>
          </Segment>
        </Rail>

        <Modal
          open={!!previewingRender}
          onClose={closePreview}
        >
          <Modal.Header>
            {
              previewingRender ? (
                `Previewing a render made ${commonFriendlyDateString(previewingRender.renderedAt)}`
              ) : null
            }
          </Modal.Header>
          <Modal.Content>
            <PreviewingRender render={previewingRender} />
          </Modal.Content>
        </Modal>
      </Segment>
    );
  }
}

function mapStateToProps({ editor: { previewingRender } }) {
  return {
    previewingRender,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    closePreview() {
      dispatch(closeRenderPreview());
    },
    openPreview(render) {
      dispatch(openRenderPreview(render));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RenderTab);
