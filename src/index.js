// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import ReactDOM from 'react-dom';
import { applyMiddleware, createStore } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';

import rootEpic from 'epics';
import rootReducer from 'reducers';

import AppContainer from 'components/app/appContainer';
import registerServiceWorker from 'registerServiceWorker';

import './polyfills';

import './index.css';

// Initialize the redux-observable epics
const epicMiddleware = createEpicMiddleware(rootEpic);

// Initialize the redux store with middleware
const store = createStore(
  rootReducer,
  applyMiddleware(epicMiddleware)
);

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
