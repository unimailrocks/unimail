import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import React, { PropTypes } from 'react';
import { Container, Header } from 'semantic-ui-react';
import { WithContext as ReactTags } from 'react-tag-input';

function AdminUserPage({ user }) {
  if (!user) {
    return (
      <div />
    );
  }

  async function removeRole(index) {
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
  return <i {...props} className="delete icon"></i>;
}

AdminUserPage.propTypes = {
  routeParams: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    emails: PropTypes.arrayOf(
      PropTypes.shape({
        address: PropTypes.string.isRequired,
        verified: PropTypes.bool.isRequired,
      })
    ).isRequired,
    roles: PropTypes.arrayOf(PropTypes.string).isRequired,
  }),
};

export default createContainer(({ routeParams }) => {
  Meteor.subscribe('usersForAdmin');

  return {
    user: Meteor.users.findOne({ _id: routeParams.id }),
  };
}, AdminUserPage);
