import React, { PropTypes } from 'react';
import { Menu, Icon, Rail } from 'semantic-ui-react';

export default function TemplateBodyLeftRail({
}) {
  return (
    <Rail attached position="left">
      <Menu icon="labeled" vertical />
    </Rail>
  );
}

TemplateBodyLeftRail.propTypes = {
};
