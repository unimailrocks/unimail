import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import React from 'react';
import { Segment, Grid } from 'semantic-ui-react';
import { Redirect } from 'react-router-dom';
import UnimailPropTypes from '/imports/prop-types';
import LoginForm from './form';

function LoginPage({ user }) {
  if (user) {
    return <Redirect to="/me" />;
  }

  return (
    <div>
      <Segment basic className="masthead" />
      <Grid centered columns={2}>
        <Grid.Column>
          <Segment>
            <LoginForm />
          </Segment>
        </Grid.Column>
      </Grid>
    </div>
  );
}

LoginPage.propTypes = {
  user: UnimailPropTypes.user,
};

LoginPage.defaultProps = {
  user: null,
};

export default createContainer(() => ({
  user: Meteor.user(),
}), LoginPage);
