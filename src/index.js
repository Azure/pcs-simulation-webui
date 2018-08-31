// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import ReactDOM from 'react-dom';
import Config from 'app.config';
import { Subject, Observable } from 'rxjs';
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
  // Create the redux store and redux-observable streams
  const store = configureStore();

  // Creating variables for Session Management
  let useEvent = new Subject();
  let logSessionStart = true;

  // Initialize the app redux data
  store.dispatch(appEpics.actions.initializeApp());

  window.addEventListener('mousemove', () => useEvent.next('u')); // might need other listeners
  window.addEventListener('keydown', () => useEvent.next('u'))

  useEvent.subscribe(count => {
    if (logSessionStart === true) {
      const sessionStartEvent = diagnosticsEvent('SessionStart', {});
      store.dispatch(appEpics.actions.updateSession(true))
      store.dispatch(appEpics.actions.logEvent(sessionStartEvent))
      logSessionStart = false;
    }

    return Observable.empty()
  })

  useEvent.debounceTime(Config.sessionTimeout).subscribe(count => {
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
