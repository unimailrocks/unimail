import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import React from 'react';
import { Segment, Grid } from 'semantic-ui-react';
import { Redirect } from 'react-router-dom';
import UnimailPropTypes from '/imports/prop-types';
import RegisterForm from './form';

function RegisterPage({ user }) {
  if (user) {
    return <Redirect to="/me" />;
  }

  return (
    <div>
      <Segment basic className="masthead" />
      <Grid centered columns={2}>
        <Grid.Column>
          <Segment>
            <RegisterForm />
          </Segment>
        </Grid.Column>
      </Grid>
    </div>
  );
}

RegisterPage.propTypes = {
  user: UnimailPropTypes.user,
};

RegisterPage.defaultProps = {
  user: null,
};

export default createContainer(() => ({
  user: Meteor.user(),
}), RegisterPage);
