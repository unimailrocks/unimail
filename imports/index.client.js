import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import '/imports/shared';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { Dimmer, Loader } from 'semantic-ui-react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import reduxThunk from 'redux-thunk';
import App from '/imports/app';
import rootReducer from './reducer';

const devtoolsMiddleware = window.__REDUX_DEVTOOLS_EXTENSION__;
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const middleware = [reduxThunk];
const reduxStore = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(...middleware)),
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
