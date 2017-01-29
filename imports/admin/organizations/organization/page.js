import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import React, { PropTypes } from 'react';
import { Grid, Container, Header } from 'semantic-ui-react';
import { WithContext as ReactTags } from 'react-tag-input';
import { Organizations } from '/imports/organizations';
import AdminUsersList from '/imports/admin/users/list';

function AdminOrganizationPage({ users, organization }) {
  let newUserInput;
  async function removePermission(index) {
    try {
      await Meteor.callPromise('organizations.permissions.remove', organization._id, organization.permissions[index]);
    } catch (err) {
      console.error('error removing organization permission:', err.message);
    }
  }

  async function addPermission(permissionName) {
    try {
      await Meteor.callPromise('organizations.permissions.create', organization._id, permissionName);
    } catch (err) {
      console.error('error adding organization permission:', err.message);
    }
  }

  async function addNewUser() {
    const { value } = newUserInput;
    try {
      const { password } = await Meteor.callPromise('organizations.users.create', organization._id, value);
    } catch (e) {
      console.error('error creating new organization user', e.message);
    }
    newUserInput.value = '';
  }

  function newUserInputKeyDown(e) {
    if (e.key === 'Enter') {
      addNewUser();
    }
  }

  if (!organization) {
    return <div />;
  }

  return (
    <Container>
      <Header>{organization.name}</Header>
      <Header sub>Permissions</Header>
      <ReactTags
        tags={permissionsToTags(organization.permissions)}
        handleDelete={removePermission}
        handleAddition={addPermission}
        classNames={{
          tags: 'ui blue labels',
          tag: 'ui label',
          tagInput: 'ui input',
        }}
        placeholder="Add new permission"
        removeComponent={RemoveX}
      />
      <Grid>
        <Grid.Row columns={2}>
          <Grid.Column textAlign="left">
            <Header sub>Users</Header>
          </Grid.Column>
          <Grid.Column textAlign="right">
            {/* use semantic ui directly */}
            <div className="ui action input">
              <input
                type="text"
                placeholder="New User email"
                ref={r => { newUserInput = r; }}
                onKeyDown={newUserInputKeyDown}
              />
              <button
                className="ui icon button"
                onClick={addNewUser}
              >
                <i className="plus icon" />
              </button>
            </div>
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <AdminUsersList
        fields={['id', 'email', 'roles']}
        users={users}
      />
    </Container>
  );
}

function permissionsToTags(permissions) {
  return permissions.map((permission, i) => ({
    id: i,
    text: permission,
  }));
}

function RemoveX(props) {
  return <i {...props} className="delete icon"></i>;
}

AdminOrganizationPage.propTypes = {
  routeParams: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  organization: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    permissions: PropTypes.arrayOf(PropTypes.string).isRequired,
  }),
  users: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default createContainer(({ routeParams }) => {
  Meteor.subscribe('organizations');
  Meteor.subscribe('usersForAdmin');

  return {
    organization: Organizations.findOne(routeParams.id),
    users: Meteor.users.find({ organizationID: routeParams.id }).fetch(),
  };
}, AdminOrganizationPage);
