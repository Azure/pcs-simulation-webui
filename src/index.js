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

  const userActivityEvents = ['mousemove', 'keydown']; // The list of all window events that would constitute user activity
  Observable.from(userActivityEvents)
    .flatMap(event => Observable.fromEvent(window, event))
    .map(_ => {
      if (logSessionStart === true) {
        const sessionStartEvent = diagnosticsEvent('SessionStart', {});
        store.dispatch(appEpics.actions.updateSession(true))
        store.dispatch(appEpics.actions.logEvent(sessionStartEvent))
        logSessionStart = false;
      }

      return Observable.empty()
    })
    .debounceTime(Config.sessionTimeout)
    .subscribe(() => {console.log(`User has been inactive for ${Config.sessionTimeout} milliseconds`)
      logSessionStart = true;
      return Observable.empty()
  });


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
