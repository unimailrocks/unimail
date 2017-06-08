import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import React from 'react';
import PropTypes from 'prop-types';
import { Container, Header } from 'semantic-ui-react';
import { WithContext as ReactTags } from 'react-tag-input';
import UnimailPropTypes from '/imports/prop-types';
import { getRoles, roles } from '/imports/accounts';

function AdminUserPage({ user }) {
  if (!user) {
    return (
      <div />
    );
  }

  async function removeRole(index) {
    const role = user.roles[index];
    if (!confirm(`Are you sure you want to delete role ${role} from user ${user.emails[0].address}?`)) {
      return;
    }
    try {
      await roles.destroy.callPromise({ userID: user._id, role });
    } catch (e) {
      console.error('error removing role', e.message);
    }
  }

  async function addRole(role) {
    try {
      await roles.create.callPromise({ userID: user._id, role });
    } catch (e) {
      console.error('error adding role', e.message);
    }
  }

  return (
    <Container>
      <Header>{user.emails[0].address}</Header>
      <Header sub>Roles</Header>
      <ReactTags
        allowDeleteFromEmptyInput={false}
        tags={rolesToTags(user.roles || [])}
        handleDelete={removeRole}
        handleAddition={addRole}
        classNames={{
          tags: 'ui blue labels',
          tag: 'ui label',
          tagInput: 'ui input',
        }}
        placeholder="Add new role"
        removeComponent={RemoveX}
      />
    </Container>
  );
}

function rolesToTags(_roles) {
  return _roles.map((role, i) => ({
    id: i,
    text: role,
  }));
}

function RemoveX(props) {
  return <i onClick={props.onClick} className={`${props.className || ''} delete icon`} />;
}

RemoveX.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func,
};

RemoveX.defaultProps = {
  className: '',
  onClick() {},
};

AdminUserPage.propTypes = {
  user: UnimailPropTypes.user,
};

AdminUserPage.defaultProps = {
  user: null,
};

export default createContainer(({ match }) => {
  Meteor.subscribe('usersForAdmin');
  const user = Meteor.users.findOne({ _id: match.params.id });

  return {
    user,
    roles: getRoles(user),
  };
}, AdminUserPage);
