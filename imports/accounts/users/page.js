import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Button, Segment, Grid, Header } from 'semantic-ui-react';
import UnimailPropTypes from '/imports/prop-types';
import ChangePasswordForm from './change-password-form';
import UpgradeToOrganizationForm from './upgrade-to-organization-form';

class UsersPage extends Component {
  static propTypes = {
    user: UnimailPropTypes.user,
  }

  static defaultProps = {
    user: null,
  }

  logOut = () => {
    Meteor.logout(err => {
      if (err) {
        alert('Some error occurred while logging out. We didn\'t even know that was possible. Please contact support and let us know how this happened');
      }
    });
  };

  render() {
    const { user } = this.props;

    if (!user) {
      return (
        <Redirect to="/" />
      );
    }
    return (
      <div>
        <Segment basic className="masthead" />
        <Grid centered columns={2}>
          <Grid.Column>
            <Segment attached>
              <Header>
                {user.emails[0].address}
              </Header>
            </Segment>
            <Segment attached>
              <ChangePasswordForm />
            </Segment>
            {
              user.organizationID ? null : (
                <Segment attached>
                  <UpgradeToOrganizationForm />
                </Segment>
              )
            }
            <Segment attached>
              <Button
                onClick={this.logOut}
              >
                Log out
              </Button>
            </Segment>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

export default createContainer(() => ({
  user: Meteor.user(),
}), UsersPage);
