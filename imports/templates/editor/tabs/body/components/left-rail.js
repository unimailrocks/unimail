import React, { PropTypes } from 'react';
import { Menu, Icon, Rail } from 'semantic-ui-react';

export default function TemplateBodyLeftRail({
  rowsLocked,
  toggleRowsLocked,
}) {
  return (
    <Rail attached position="left">
      <Menu icon="labeled" vertical>
        <Menu.Item
          name="rows-locked"
          active={rowsLocked}
          onClick={toggleRowsLocked}
        >
          <Icon name={rowsLocked ? 'unlock' : 'lock'} />
          {rowsLocked ? 'Unlock Rows' : 'Lock Rows'}

        </Menu.Item>
      </Menu>
    </Rail>
  );
}

TemplateBodyLeftRail.propTypes = {
  rowsLocked: PropTypes.bool.isRequired,
  toggleRowsLocked: PropTypes.func.isRequired,
};
