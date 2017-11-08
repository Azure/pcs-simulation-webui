import React from 'react';
import ReactDOM from 'react-dom';
import { applyMiddleware, createStore } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import rootEpic from 'epics';
import rootReducer from 'reducers';
import { startTimer } from 'actions';

import App from 'components/app/app';
import registerServiceWorker from 'registerServiceWorker';

import './index.css';

// Initialize the redux-observable epics
const epicMiddleware = createEpicMiddleware(rootEpic);

// Initialize the redux store with middleware
const store = createStore(
  rootReducer,
  applyMiddleware(epicMiddleware)
);

store.dispatch(startTimer());

// Create the React app
ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>, 
  document.getElementById('root')
);

registerServiceWorker();
