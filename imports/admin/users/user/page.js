import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import React, { PropTypes } from 'react';
import { Container, Header } from 'semantic-ui-react';
import { WithContext as ReactTags } from 'react-tag-input';
import UnimailPropTypes from '/imports/prop-types';
import { getRoles } from '/imports/accounts';

function AdminUserPage({ user }) {
  if (!user) {
    return (
      <div />
    );
  }

  async function removeRole(index) {
    if (!confirm(`Are you sure you want to delete role ${user.roles[index]} from user ${user.emails[0].address}?`)) {
      return;
    }
    try {
      await Meteor.callPromise('roles.delete', user._id, user.roles[index]);
    } catch (e) {
      console.error('error removing role', err.message);
    }
  }

  async function addRole(role) {
    try {
      await Meteor.callPromise('roles.create', user._id, role);
    } catch (e) {
      console.error('error adding role', err.message);
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

function rolesToTags(roles) {
  return roles.map((role, i) => ({
    id: i,
    text: role,
  }));
}

function RemoveX(props) {
  return <i {...props} className="delete icon" />;
}

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
