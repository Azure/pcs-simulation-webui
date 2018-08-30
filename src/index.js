// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import ReactDOM from 'react-dom';
import Rx from 'rxjs';
import { Observable } from 'rxjs';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';

import configureStore from 'store/configureStore';
import diagnosticsEvent from 'store/logEventUtil';
import AppContainer from 'components/app/app.container';
import registerServiceWorker from 'registerServiceWorker';
import { AuthService } from 'services';
import { epics as appEpics } from 'store/reducers/appReducer';

// Initialize internationalization
import './i18n';

// Include cross browser polyfills
import './polyfills';

// Include base page css
import './index.css';

// Initialize the user authentication
AuthService.onLoad(() => {
  // Session timeout constant
  const SESSION_TIMEOUT = 1200000;

  // Create the redux store and redux-observable streams
  const store = configureStore();
  const state = store.getState();
  const userLoginEvent = diagnosticsEvent('UserLogInSuccess', {});

  // Creating variables for Session Management
  var useEvent = new Rx.Subject();
  var logSessionStart = true;

  // Logging 'Successful user login' to diagnostics
  store.dispatch(appEpics.actions.logEvent(userLoginEvent, state))

  // Initialize the app redux data
  store.dispatch(appEpics.actions.initializeApp());

  window.addEventListener('mousemove', () => useEvent.next('u')); // might need other listeners
  window.addEventListener('keydown', () => useEvent.next('u'))

  useEvent.subscribe(count => {
    if(logSessionStart === true){
      const sessionStartEvent = diagnosticsEvent('SessionStart', {});
      store.dispatch(appEpics.actions.updateSession(true))
      store.dispatch(appEpics.actions.logEvent(sessionStartEvent, state))
      logSessionStart = false;
    }

    return Observable.empty()
  })

  useEvent.debounceTime(SESSION_TIMEOUT).subscribe(count => {
    logSessionStart = true;
    return Observable.empty()
  })

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
});
