import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import React, { PropTypes } from 'react';
import { Container, Header } from 'semantic-ui-react';
import { WithContext as ReactTags } from 'react-tag-input';
import { addRole, removeRole } from '/imports/accounts';

function AdminUserPage({ user }) {
  async function _removeRole(index) {
    const err = await removeRole(user._id, user.roles[index]);
    if (err) {
      console.log('error!!!', err.message);
    }
  }

  function _addRole(role) {
    addRole(user._id, role);
  }

  return (
    <Container>
      <Header>{user.emails[0].address}</Header>
      <Header sub>Roles</Header>
      <ReactTags
        tags={rolesToTags(user.roles)}
        handleDelete={_removeRole}
        handleAddition={_addRole}
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
  }).isRequired,
};

export default createContainer(({ routeParams }) => {
  return {
    user: Meteor.users.findOne({ _id: routeParams.id }),
  };
}, AdminUserPage);
