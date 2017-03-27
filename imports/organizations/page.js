import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import React, { PropTypes } from 'react';
import { Grid, Container, Header } from 'semantic-ui-react';
import UnimailPropTypes from '/imports/prop-types';
import { Organizations } from '/imports/organizations';
import UsersList from '/imports/organizations/users/list';

function OrganizationPage({ users, organization }) {
  let newUserInput;
  async function addNewUser() {
    const { value } = newUserInput;
    newUserInput.value = '';
    try {
      await Meteor.callPromise('organizations.users.create', organization._id, value);
    } catch (e) {
      console.error('error creating new organization user', e.message);
    }
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
      <Container className="masthead" />
      <Header>{organization.name}</Header>
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
      <UsersList
        fields={['id', 'email', 'roleName']}
        users={users}
      />
    </Container>
  );
}

OrganizationPage.propTypes = {
  organization: UnimailPropTypes.organization,
  users: PropTypes.arrayOf(UnimailPropTypes.user),
};

OrganizationPage.defaultProps = {
  organization: null,
  users: null,
};

OrganizationPage.defaultProps = {
  organization: null,
};

export default createContainer(() => {
  Meteor.subscribe('organizations');
  Meteor.subscribe('users');

  const user = Meteor.user();

  return {
    organization: Organizations.findOne({ _id: user.organizationID }),
    users: Meteor.users.find({ organizationID: user.organizationID }).fetch(),
  };
}, OrganizationPage);
