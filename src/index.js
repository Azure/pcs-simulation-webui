// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';

import configureStore from 'store/configureStore';
import AppContainer from 'components/app/app.container';
import registerServiceWorker from 'registerServiceWorker';
import { AuthService } from 'services';
import { epics as appEpics } from 'store/reducers/appReducer';

import './polyfills';

import './index.css';

// Initialize the user authentication
AuthService.onLoad();

// Create the redux store and redux-observable streams
const store = configureStore();

// Initialize the app redux data
store.dispatch(appEpics.actions.initializeApp());

// Create the React app
ReactDOM.render(
  <Provider store={store}>
    <Router>
      <AppContainer />
    </Router>
  </Provider>,
  document.getElementById('root')
);

registerServiceWorker();
