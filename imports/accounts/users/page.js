import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { Button, Segment, Grid, Header } from 'semantic-ui-react';
import ChangePasswordForm from './change-password-form';
import UpgradeToOrganizationForm from './upgrade-to-organization-form';

export default class UsersPage extends Component {
  logOut = () => {
    Meteor.logout(err => {
      if (err) {
        alert('Some error occurred while logging out. We didn\'t even know that was possible. Please contact support and let us know how this happened');
      }

      browserHistory.push('/');
    });
  };

  render() {
    return (
      <div>
        <Segment basic className="masthead" />
        <Grid centered columns={2}>
          <Grid.Column>
            <Segment attached>
              <Header>
                {Meteor.user().emails[0].address}
              </Header>
            </Segment>
            <Segment attached>
              <ChangePasswordForm />
            </Segment>
            {
              Meteor.user().organizationID ? null : (
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
