import React from 'react';
import { Segment, Grid } from 'semantic-ui-react';
import LoginForm from './form';

export default function LoginPage() {
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
