import React from 'react';
import { connect } from 'react-redux';
import { Message, Icon, Button } from 'semantic-ui-react';

import colors from '/imports/styles/colors';
import { cancelDelete } from '/imports/templates/editor/duck';
import { getMovingPaths } from '/imports/templates/editor/selectors';

export const zIndex = 1000;

function DeletingShroud({ onDelete, cancelDelete, countToDelete }) {
  const message = countToDelete === 1 ?
    'If you confirm, you will delete this item and all nested items' :
    `If you confirm, you will delete ${countToDelete} items and all nested items`;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex,
        backgroundColor: colors.black.alpha('0.2').toString(),
        color: colors.white.toString(),
      }}
      onClick={cancelDelete}
    >
      <Message error icon>
        <Icon name="trash" />
        <Message.Content>
          <Message.Header>
            Are you sure you want to delete these elements?
          </Message.Header>
          {message}
          <em> (press &lt;delete&gt; to confirm more quickly)</em>
          <br />
          <br />
          <hr />
          <br />
          <Button size="mini" basic color="red" onClick={onDelete}>Confirm</Button>
          <Button size="mini" basic color="grey" onClick={cancelDelete}>Cancel</Button>
        </Message.Content>
      </Message>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    countToDelete: getMovingPaths(state).length,
  };
}

export default connect(mapStateToProps, { cancelDelete })(DeletingShroud);
