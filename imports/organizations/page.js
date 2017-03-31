import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import React, { PropTypes, Component } from 'react';
import { Label, Grid, Container, Header } from 'semantic-ui-react';
import UnimailPropTypes from '/imports/prop-types';
import { isRole } from '/imports/accounts';
import { Organizations } from '/imports/organizations';
import StandardInput from '/imports/components/standard-input';
import UsersList from '/imports/organizations/users/list';

class OrganizationPage extends Component {
  state = {
    errors: {},
  }

  addNewUser = async email => {
    try {
      await Meteor.callPromise('organizations.users.create', this.props.organization._id, email);
    } catch (e) {
      this.setState(state => ({
        errors: {
          ...state.errors,
          userCreate: e.error,
        },
      }));
    }
  }

  canInviteUser = () => isRole(Meteor.user(), 'organizations.manage') || isRole(Meteor.user(), 'organizations.admin')

  render() {
    const { users, organization } = this.props;

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
            {
              this.canInviteUser() ?
                <Grid.Column textAlign="right">
                  {/* use semantic ui directly */}
                  <div className="ui action input">
                    {
                      this.state.errors.userCreate ?
                        <Label
                          basic
                          color="red"
                          pointing="right"
                        >{this.state.errors.userCreate}</Label>
                        : null
                    }
                    <StandardInput
                      onTrigger={this.addNewUser}
                      triggerOnBlur={false}
                      clearOnSubmit
                      type="text"
                      placeholder="New User email"
                      icon="plus"
                    />
                  </div>
                </Grid.Column>
                : null
            }
          </Grid.Row>
        </Grid>
        <UsersList
          fields={['id', 'email', 'roleName']}
          users={users}
        />
      </Container>
    );
  }
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
