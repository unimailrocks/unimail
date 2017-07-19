import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Popup, Menu, Button } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import UnimailPropTypes from '/imports/prop-types';
import { commonFriendlyDateString } from '/imports/utils/strings';
import colors from '/imports/styles/colors';

import { Renders } from '/imports/templates/methods';
import { openRenderPreview } from '/imports/templates/editor/duck';

const styles = StyleSheet.create({
  clickable: {
    ':hover': {
      backgroundColor: colors.grey2.alpha(0.1).string(),
    },
    cursor: 'pointer',
  },
  renderPreview: {
    width: '90%',
    margin: '0 auto',
    display: 'block',
  },
  render: {
    borderBottom: `1px solid ${colors.grey2.alpha(0.2).string()}`,
    paddingBottom: 5,
    paddingTop: 5,
  },
});

class Render extends Component {
  static propTypes = {
    render: UnimailPropTypes.render.isRequired,
    openPreview: PropTypes.func.isRequired,
    template: UnimailPropTypes.template.isRequired,
  }

  sendEmailPreview = async e => {
    e.stopPropagation();

    await Renders.emailPreview.callPromise({
      renderID: this.props.render._id,
      templateID: this.props.template._id,
    });
  }

  render() {
    const { render, openPreview } = this.props;
    const friendlyRenderedAt = commonFriendlyDateString(render.renderedAt);
    return (
      <div className={css(styles.render)}>
        Rendered {friendlyRenderedAt}
        <Button
          basic
          onClick={() => openPreview(render)}
        >
          <img
            alt={`Open a preview of a rendering of this template, created ${friendlyRenderedAt}`}
            className={css(styles.renderPreview)}
            src={`https://render-previews.unimail.co/${render.previewImageKey}`}
          />

          <Menu size="tiny" compact floated="right">
            <Popup
              trigger={
                <Menu.Item
                  icon="download"
                  href={`data:text/html;charset=utf-8,${encodeURIComponent(render.html)}`}
                  download={`Rendered ${friendlyRenderedAt}`}
                  onClick={e => e.stopPropagation()}
                />
              }
              content="Download email as HTML"
            />

            <Popup
              trigger={
                <Menu.Item
                  icon="mail outline"
                  onClick={this.sendEmailPreview}
                />
              }
              content="Send email to my email address"
            />

            <Popup
              trigger={
                <Menu.Item icon="expand" />
              }
              content="Preview email now"
            />
          </Menu>
        </Button>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    openPreview(renderID) {
      dispatch(openRenderPreview(renderID));
    },
  };
}

export default connect(null, mapDispatchToProps)(Render);
