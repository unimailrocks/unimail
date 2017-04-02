import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import '/imports/shared';
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Dimmer, Loader } from 'semantic-ui-react';
import App from '/imports/app';

function Routes({ userLoading }) {
  return (
    <div>
      <Dimmer active={userLoading}>
        <Loader />
      </Dimmer>
      <Router>
        <App />
      </Router>
    </div>
  );
}

Routes.propTypes = {
  userLoading: PropTypes.bool.isRequired,
};

const ContainedRoutes = createContainer(() => {
  Meteor.subscribe('myUser');
  return { user: Meteor.user(), userLoading: Meteor.loggingIn() };
}, Routes);

Meteor.startup(async () => {
  ReactDOM.render(
    <ContainedRoutes />
    , document.getElementById('render-target'),
  );
});
