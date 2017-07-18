import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { commonFriendlyDateString } from '/imports/utils/strings';
import UnimailPropTypes from '/imports/prop-types';
import colors from '/imports/styles/colors';
import { openRenderPreview } from '/imports/templates/editor/duck';

const styles = StyleSheet.create({
  render: {
    ':hover': {
      backgroundColor: colors.grey2.alpha(0.1).string(),
    },
    borderBottom: `1px solid ${colors.grey2.alpha(0.1).string()}`,
    height: '200px',
    cursor: 'pointer',
  },
  renderPreview: {
    width: '90%',
    margin: '0 auto',
    display: 'block',
  },
});

function Render({ render, openPreview }) {
  return (
    <div
      className={css(styles.render)}
      onClick={() => openPreview(render)}
    >
      Rendered {commonFriendlyDateString(render.renderedAt)}
      <img
        alt={`A rendering of this template, created ${commonFriendlyDateString(render.renderedAt)}`}
        className={css(styles.renderPreview)}
        src={`https://render-previews.unimail.co/${render.previewImageKey}`}
      />
    </div>
  );
}

Render.propTypes = {
  render: UnimailPropTypes.render.isRequired,
  openPreview: PropTypes.func.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    openPreview(renderID) {
      dispatch(openRenderPreview(renderID));
    },
  };
}

export default connect(null, mapDispatchToProps)(Render);
