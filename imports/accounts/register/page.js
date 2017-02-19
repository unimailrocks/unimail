import React from 'react';
import { Segment, Grid } from 'semantic-ui-react';
import RegisterForm from './form';

export default function RegisterPage() {
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
