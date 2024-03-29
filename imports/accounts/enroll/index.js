import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import React from 'react';
import { Segment, Grid } from 'semantic-ui-react';

import { Organizations } from '/imports/organizations';
import UnimailPropTypes from '/imports/prop-types';
import EnrollForm from './form';

function _EnrollPage({ organization, user, match }) {
  const { token } = match.params;
  if (Meteor.user()) {
    return (
      <div>
        <Segment basic className="masthead" />
        <Grid centered columns={2}>
          <Grid.Column>
            <Segment>
              <p>You are already signed in!</p>
            </Segment>
          </Grid.Column>
        </Grid>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <Segment basic className="masthead" />
        <Grid centered columns={2}>
          <Grid.Column>
            <Segment>
              <p>This enrollment link is no longer valid.</p>
            </Segment>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
  return (
    <div>
      <Segment basic className="masthead" />
      <Grid centered columns={2}>
        <Grid.Column>
          <Segment>
            <h1>Join {organization.name} on Unimail</h1>
            <EnrollForm user={user} token={token} />
          </Segment>
        </Grid.Column>
      </Grid>
    </div>
  );
}

_EnrollPage.propTypes = {
  match: UnimailPropTypes.match.isRequired,
  organization: UnimailPropTypes.organization,
  user: UnimailPropTypes.user,
};

_EnrollPage.defaultProps = {
  organization: null,
  user: null,
};

export const EnrollPage = createContainer(({ match }) => {
  const { token } = match.params;
  Meteor.subscribe('users', token);
  Meteor.subscribe('organizations', token);

  return {
    user: Meteor.users.findOne(),
    organization: Organizations.findOne(),
  };
}, _EnrollPage);
