import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import '/imports/shared';
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { Dimmer, Loader } from 'semantic-ui-react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import App from '/imports/app';
import rootReducer from './reducer';

const reduxStore = createStore(
  rootReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
);

function Root({ userLoading }) {
  return (
    <Provider store={reduxStore}>
      <div>
        <Dimmer active={userLoading}>
          <Loader />
        </Dimmer>
        <Router>
          <App />
        </Router>
      </div>
    </Provider>
  );
}

Root.propTypes = {
  userLoading: PropTypes.bool.isRequired,
};

const ContainedRoot = createContainer(() => {
  Meteor.subscribe('myUser');
  return { user: Meteor.user(), userLoading: Meteor.loggingIn() };
}, Root);

Meteor.startup(() => {
  ReactDOM.render(
    <ContainedRoot />
    , document.getElementById('render-target'),
  );
});
